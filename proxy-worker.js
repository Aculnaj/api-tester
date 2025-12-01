/**
 * Cloudflare Workers CORS Proxy
 * 
 * This worker acts as a CORS proxy for API requests that would otherwise
 * be blocked by browser CORS policy.
 * 
 * Usage: https://your-worker.workers.dev/?url=<encoded_url>
 * Or: https://your-worker.workers.dev/<url>
 * 
 * Deploy to Cloudflare Workers:
 * 1. Go to https://workers.cloudflare.com/
 * 2. Create a new worker
 * 3. Paste this code
 * 4. Deploy
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    try {
      // Get target URL from query parameter or path
      const url = new URL(request.url);
      let targetUrl = url.searchParams.get('url');
      
      // If no query parameter, try to extract from path
      if (!targetUrl) {
        const path = url.pathname.slice(1); // Remove leading slash
        if (path) {
          // Check if path starts with http:// or https://
          if (path.startsWith('http://') || path.startsWith('https://')) {
            targetUrl = path + url.search;
          } else if (path.startsWith('http:/') || path.startsWith('https:/')) {
            // Handle case where :// becomes :/ due to URL parsing
            targetUrl = path.replace(/^(https?):\//, '$1://') + url.search;
          }
        }
      }

      if (!targetUrl) {
        return new Response(JSON.stringify({
          error: 'Missing target URL',
          usage: 'Pass the target URL as ?url=<encoded_url> or as the path /<url>',
          examples: [
            'https://your-worker.workers.dev/?url=https://api.example.com/endpoint',
            'https://your-worker.workers.dev/https://api.example.com/endpoint'
          ]
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(request)
          }
        });
      }

      // Decode URL if it was encoded
      try {
        targetUrl = decodeURIComponent(targetUrl);
      } catch (e) {
        // URL was not encoded, use as-is
      }

      // Validate target URL
      let parsedTarget;
      try {
        parsedTarget = new URL(targetUrl);
      } catch (e) {
        return new Response(JSON.stringify({
          error: 'Invalid target URL',
          url: targetUrl
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(request)
          }
        });
      }

      // Clone the request headers, excluding host-related headers
      const headers = new Headers();
      for (const [key, value] of request.headers.entries()) {
        const lowerKey = key.toLowerCase();
        // Skip headers that shouldn't be forwarded
        if (lowerKey === 'host' || 
            lowerKey === 'origin' || 
            lowerKey === 'referer' ||
            lowerKey === 'cf-connecting-ip' ||
            lowerKey === 'cf-ipcountry' ||
            lowerKey === 'cf-ray' ||
            lowerKey === 'cf-visitor' ||
            lowerKey === 'x-forwarded-proto' ||
            lowerKey === 'x-real-ip') {
          continue;
        }
        headers.set(key, value);
      }

      // Build the proxied request
      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'follow'
      });

      // Make the request to the target
      const response = await fetch(proxyRequest);

      // Clone response headers and add CORS headers
      const responseHeaders = new Headers(response.headers);
      const corsHeaders = getCorsHeaders(request);
      for (const [key, value] of Object.entries(corsHeaders)) {
        responseHeaders.set(key, value);
      }

      // Return the proxied response with CORS headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Proxy error',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(request)
        }
      });
    }
  }
};

/**
 * Handle CORS preflight requests
 */
function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request)
  });
}

/**
 * Get CORS headers
 */
function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || 
      'Content-Type, Authorization, X-API-Key, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': '*'
  };
}