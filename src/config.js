// In production we expect API to live on the same origin under /api (Vercel serverless functions).
// In development we hit the local json-server. REACT_APP_API_URL can override if needed.
export const API_URL =
  process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3131/api');
