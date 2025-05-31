const http = require('http');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const serveStatic = require('serve-static');

const buildPath = path.join(__dirname, 'build');

// Create HTTP server
const server = http.createServer((req, res) => {
  // Handle static files with cache control
  const staticServe = serveStatic(buildPath, {
    maxAge: '1y',
    immutable: true
  });
  
  // Serve static files
  staticServe(req, res, (err) => {
    if (err) {
      if (err.status === 404) {
        // Serve index.html for all other routes
        fs.readFile(path.join(buildPath, 'index.html'), (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          }
        });
      } else {
        res.writeHead(err.status || 500);
        res.end(err.message);
      }
    }
  });
});

// Add compression
server.on('request', compression());

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
