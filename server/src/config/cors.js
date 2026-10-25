/**
 * Unified CORS configuration for Express REST endpoints and Socket.IO WebSockets.
 * Supports development localhost ports, configured production domains,
 * and dynamic Vercel preview deployments (*.vercel.app).
 */

const getAllowedOrigins = () => {
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://localhost:4173', // Vite preview port
  ];

  // Check both CLIENT_URL and CLIENT_ORIGIN
  const configured = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN;
  if (configured) {
    // Support comma-separated origins if multiple frontend domains exist
    configured.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/$/, ''); // Remove trailing slash
      if (trimmed && !defaultOrigins.includes(trimmed)) {
        defaultOrigins.push(trimmed);
      }
    });
  }

  return defaultOrigins;
};

const isOriginAllowed = (origin) => {
  // Allow non-browser requests (server-to-server, mobile apps, Postman, curl)
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, '');
  const allowed = getAllowedOrigins();

  if (allowed.includes(normalizedOrigin)) {
    return true;
  }

  // Allow all Vercel deployment URLs (production & preview branches)
  if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(normalizedOrigin)) {
    return true;
  }

  // Allow Render preview URLs if applicable
  if (/^https:\/\/[a-zA-Z0-9_-]+\.onrender\.com$/.test(normalizedOrigin)) {
    return true;
  }

  // Permissive fallback in development/test
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return false;
};

module.exports = {
  getAllowedOrigins,
  isOriginAllowed,
};
