import { createServer, Response } from 'miragejs';

export function makeServer() {
  const server = createServer({
    routes() {
      const tenantConfigs: Record<string, { storeCode: string; storeName: string; templateCode: string }> = {
        'one.stage.ecombaker.com': {
          storeCode: 'TJ2M0H4C',
          storeName: 'Personal Loan Account',
          templateCode: 'TEMP-004',  // → Template D (Minimal Dark)
        },
        'app.stage.ecombaker.com': {
          storeCode: 'APP9001',
          storeName: 'App Stage Store',
          templateCode: 'TEMP-001',  // → Template A (Classic)
        },
        'grid.stage.ecombaker.com': {
          storeCode: 'GRID001',
          storeName: 'Grid Demo Store',
          templateCode: 'TEMP-002',  // → Template B (Modern Grid)
        },
        'nav.stage.ecombaker.com': {
          storeCode: 'NAV001',
          storeName: 'Nav Demo Store',
          templateCode: 'TEMP-003',  // → Template C (Sidebar)
        },
      };

      // Mirrors the real backend: reads Host header, no query param
      this.get('/api/template-code', (_schema, request) => {
        const domain = (request.requestHeaders['host'] ||
          window.location.hostname).toLowerCase();

        const fromMap = tenantConfigs[domain];
        if (fromMap) {
          return fromMap;
        }

        // Fallback: derive from subdomain, cycle through all 4 templates
        const sub = domain.split('.')[0] || 'gen';
        const fallbackTemplates = ['TEMP-001', 'TEMP-002', 'TEMP-003', 'TEMP-004'];
        const idx = sub.charCodeAt(0) % 4;
        return {
          storeCode: `TEN-${sub.toUpperCase()}`,
          storeName: `Store for ${domain}`,
          templateCode: fallbackTemplates[idx],
        };
      });

      // Optional: Error simulation for testing error handling
      this.get('/api/template/error', () => {
        return new Response(500, {}, { error: 'Internal Server Error', message: 'Something went wrong' });
      });
    },

    // Optional: Add timing delay to simulate network latency
    timing: 800, // 800ms delay to see loading state
  });

  return server;
}
