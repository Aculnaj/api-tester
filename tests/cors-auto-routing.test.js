const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const rootDir = path.resolve(__dirname, '..');

/**
 * Load providers.js against a fake browser: a scripted fetch, a localStorage
 * stub, and a location origin. Returns the Providers object plus the call log.
 */
function loadProviders({ fetchImpl, storedRoutes }) {
    const store = new Map();
    if (storedRoutes) store.set('api-tester:proxy-routes', JSON.stringify(storedRoutes));

    const calls = [];
    const window = {
        location: { origin: 'https://aculnaj.github.io' },
        localStorage: {
            getItem: (key) => (store.has(key) ? store.get(key) : null),
            setItem: (key, value) => store.set(key, value)
        }
    };

    const sandbox = {
        window,
        URL,
        Map,
        TypeError,
        JSON,
        fetch: (url, options) => {
            calls.push(url);
            return fetchImpl(url, options);
        }
    };

    const source = fs.readFileSync(path.join(rootDir, 'js/api/providers.js'), 'utf8');
    vm.runInNewContext(source, sandbox);

    return { Providers: window.Providers, calls, store };
}

function okResponse() {
    return { ok: true, status: 200, statusText: 'OK', json: async () => ({ data: [] }) };
}

test('a reachable provider is called directly, never through the proxy', async () => {
    const { Providers, calls } = loadProviders({
        fetchImpl: async () => okResponse()
    });

    await Providers.fetchAuto('https://api.aetherapi.dev/v1/models');

    assert.deepEqual(calls, ['https://api.aetherapi.dev/v1/models']);
});

test('a CORS-blocked provider is retried through the proxy', async () => {
    const { Providers, calls } = loadProviders({
        fetchImpl: async (url) => {
            if (url.startsWith('https://corsproxy.')) return okResponse();
            throw new TypeError('Failed to fetch');
        }
    });

    const response = await Providers.fetchAuto('https://api.x.ai/v1/models');

    assert.equal(response.ok, true);
    assert.equal(calls.length, 2);
    assert.equal(calls[1], 'https://corsproxy.el1druz0.workers.dev/https://api.x.ai/v1/models');
});

test('a remembered proxy route skips the doomed direct attempt', async () => {
    const { Providers, calls } = loadProviders({
        storedRoutes: { 'https://api.x.ai': 'proxy' },
        fetchImpl: async (url) => {
            assert.ok(url.startsWith('https://corsproxy.'), `unexpected direct call to ${url}`);
            return okResponse();
        }
    });

    await Providers.fetchAuto('https://api.x.ai/v1/models');

    assert.equal(calls.length, 1);
});

test('a learned proxy route is persisted for the next session', async () => {
    const { Providers, store } = loadProviders({
        fetchImpl: async (url) => {
            if (url.startsWith('https://corsproxy.')) return okResponse();
            throw new TypeError('Failed to fetch');
        }
    });

    await Providers.fetchAuto('https://api.x.ai/v1/models');

    assert.deepEqual(JSON.parse(store.get('api-tester:proxy-routes')), {
        'https://api.x.ai': 'proxy'
    });
});

test('an HTTP error response is reported as-is, not retried via the proxy', async () => {
    const { Providers, calls } = loadProviders({
        fetchImpl: async () => ({ ok: false, status: 401, statusText: 'Unauthorized' })
    });

    const response = await Providers.fetchAuto('https://api.aetherapi.dev/v1/models');

    assert.equal(response.status, 401);
    assert.equal(calls.length, 1, 'a 401 must not burn a proxied retry');
});

test('an aborted request is rethrown instead of being retried', async () => {
    const { Providers, calls } = loadProviders({
        fetchImpl: async () => {
            const abort = new Error('The user aborted a request.');
            abort.name = 'AbortError';
            throw abort;
        }
    });

    await assert.rejects(
        () => Providers.fetchAuto('https://api.aetherapi.dev/v1/chat/completions'),
        /aborted/
    );
    assert.equal(calls.length, 1);
});

test('a blocked provider that also fails via the proxy explains itself', async () => {
    const { Providers } = loadProviders({
        fetchImpl: async () => {
            throw new TypeError('Failed to fetch');
        }
    });

    await assert.rejects(
        () => Providers.fetchAuto('https://api.x.ai/v1/models'),
        /both directly and via the CORS proxy/
    );
});

test('a proxy that never reached the provider reports why, not a bare 500', async () => {
    const { Providers } = loadProviders({
        fetchImpl: async (url) => {
            if (url.startsWith('https://corsproxy.')) {
                return {
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                    json: async () => ({ error: 'Proxy error', message: 'Network connection lost.' }),
                    clone: () => ({
                        json: async () => ({ error: 'Proxy error', message: 'Network connection lost.' })
                    })
                };
            }
            throw new TypeError('Failed to fetch');
        }
    });

    await assert.rejects(
        () => Providers.fetchAuto('https://inference.baseten.co/v1/models'),
        /CORS proxy could not reach https:\/\/inference\.baseten\.co \(Network connection lost\.\)/
    );
});

test('a provider rejection through the proxy is passed through for the caller to report', async () => {
    const { Providers } = loadProviders({
        fetchImpl: async (url) => {
            if (url.startsWith('https://corsproxy.')) {
                return {
                    ok: false,
                    status: 401,
                    statusText: 'Unauthorized',
                    json: async () => ({ error: { message: 'Incorrect API key' } })
                };
            }
            throw new TypeError('Failed to fetch');
        }
    });

    const response = await Providers.fetchAuto('https://api.replicate.com/v1/models');

    assert.equal(response.status, 401);
});

test('an HTML edge error through the proxy still names the provider and status', async () => {
    const { Providers } = loadProviders({
        fetchImpl: async (url) => {
            if (url.startsWith('https://corsproxy.')) {
                return {
                    ok: false,
                    status: 502,
                    statusText: 'Bad Gateway',
                    json: async () => { throw new SyntaxError('Unexpected token <'); }
                };
            }
            throw new TypeError('Failed to fetch');
        }
    });

    await assert.rejects(
        () => Providers.fetchAuto('https://inference.baseten.co/v1/models'),
        /CORS proxy could not reach https:\/\/inference\.baseten\.co \(502 Bad Gateway\)/
    );
});

test('getBaseUrl never embeds the proxy - routing is decided per request', () => {
    const { Providers } = loadProviders({ fetchImpl: async () => okResponse() });

    assert.equal(
        Providers.getBaseUrl('aetherapi'),
        'https://api.aetherapi.dev/v1'
    );
});
