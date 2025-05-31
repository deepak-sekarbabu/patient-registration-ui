const http = require('http');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const serveStatic = require('serve-static');

const buildPath = path.join(__dirname, 'build');

// Function to set custom headers
function setCustomHeaders(res, filePath, stat) {
  const ext = path.extname(filePath).toLowerCase();
  let contentType;

  switch (ext) {
    case '.woff':
      contentType = 'font/woff';
      break;
    case '.woff2':
      contentType = 'font/woff2';
      break;
    case '.ttf':
      contentType = 'font/ttf';
      break;
    case '.otf':
      contentType = 'font/otf';
      break;
    case '.eot':
      contentType = 'application/vnd.ms-fontobject';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    // Add other non-textual types as needed
  }

  if (contentType) {
    res.setHeader('Content-Type', contentType);
  }
  // Ensure Expires header is not sent, to rely on Cache-Control: max-age and immutable.
  res.removeHeader('Expires');
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Handle static files with cache control and custom headers
  const staticServe = serveStatic(buildPath, {
    maxAge: '1y',
    immutable: true,
    setHeaders: setCustomHeaders
  });
  
  // Serve static files
  // This callback is only called if serveStatic encounters an error or doesn't find the file.
  staticServe(req, res, (err) => {
    // If serveStatic has an error (like file not found, which results in a 404 status)
    if (err) {
      if (err.status === 404) {
        // Serve index.html for all other routes (SPA fallback)
        fs.readFile(path.join(buildPath, 'index.html'), (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(500);
            res.end('Internal Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexData);
          }
        });
      } else {
        // Other serveStatic errors (e.g., permission issues)
        res.writeHead(err.status || 500);
        res.end(err.message);
      }
    }
    // If there's no error, serveStatic has already handled the response.
  });
});

// Add compression
server.on('request', compression());

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
