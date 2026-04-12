/**
 * Mirage JS Configuration
 * 
 * Controls whether to use the mock API or a real backend
 */

export const ENABLE_MIRAGE = import.meta.env.MODE === 'development';

/**
 * When ENABLE_MIRAGE is true:
 * - All API calls to /api/template/config will be intercepted by Mirage
 * - Responses are generated from the mock server configuration
 * - Network latency is simulated (800ms delay)
 * 
 * When false:
 * - API calls go directly to the backend
 * - Uses proxy configured in vite.config.ts
 */
