// Vercel Serverless Function entrypoint for the Express app
// It strips the '/api' prefix so existing routes like '/products' keep working.

import app from '../src/server.js';

export default function handler(req, res) {
  // Ensure paths like /api/products -> /products inside Express
  if (req.url && req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api(\/|$)/, '/');
  }
  return app(req, res);
}