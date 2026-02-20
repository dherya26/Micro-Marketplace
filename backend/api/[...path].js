// Vercel catch-all Serverless Function to handle any /api/* route with the Express app
import app from '../src/server.js';

export default function handler(req, res) {
  // Normalize to Express routes by stripping the '/api' prefix if present
  if (req.url && req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api(\/|$)/, '/');
  }
  return app(req, res);
}