const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const rootDir = path.resolve(__dirname, '..');

function loadProviders() {
    const sandbox = { window: {} };
    const source = fs.readFileSync(path.join(rootDir, 'js/api/providers.js'), 'utf8');
    vm.runInNewContext(source, sandbox);
    return sandbox.window.Providers;
}

function loadForms(document) {
    const sandbox = { window: {}, document };
    const source = fs.readFileSync(path.join(rootDir, 'js/ui/forms.js'), 'utf8');
    vm.runInNewContext(source, sandbox);
    return sandbox.window.Forms;
}

test('Anthropic provider uses a custom base URL when one is configured', () => {
    const Providers = loadProviders();

    const baseUrl = Providers.getBaseUrl('anthropic', 'https://anthropic-compatible.example/v1/');

    assert.equal(baseUrl, 'https://anthropic-compatible.example/v1');
});

test('Anthropic Compatible provider uses its configured base URL', () => {
    const Providers = loadProviders();

    const baseUrl = Providers.getBaseUrl('anthropic_compatible', 'https://proxy.example/messages/v1/');

    assert.equal(baseUrl, 'https://proxy.example/messages/v1');
});

test('base URL field is visible for Anthropic-compatible providers', () => {
    const classList = {
        hidden: false,
        toggle(className, force) {
            assert.equal(className, 'hidden');
            this.hidden = force;
        }
    };

    const document = {
        getElementById(id) {
            assert.equal(id, 'base-url-container');
            return { classList };
        }
    };
    const Forms = loadForms(document);

    Forms.updateBaseUrlVisibility('anthropic');
    assert.equal(classList.hidden, false);

    Forms.updateBaseUrlVisibility('openai_compatible');
    assert.equal(classList.hidden, false);

    Forms.updateBaseUrlVisibility('anthropic_compatible');
    assert.equal(classList.hidden, false);

    Forms.updateBaseUrlVisibility('openai');
    assert.equal(classList.hidden, true);
});
