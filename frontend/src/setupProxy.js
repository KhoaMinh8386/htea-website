const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to:', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Proxy Error' });
      }
    })
  );
}; 