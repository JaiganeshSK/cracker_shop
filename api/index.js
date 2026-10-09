const app = require('../server/server');

module.exports = (req, res) => {
  const matched = req.headers['x-matched-path'] || req.headers['x-now-route-matches'];
  if (matched && (req.url === '/api/index.js' || req.url.startsWith('/api/index.js'))) {
    req.url = matched;
  }
  return app(req, res);
};