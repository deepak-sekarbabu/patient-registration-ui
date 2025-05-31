const express = require('express');
const path = require('path');
const compression = require('compression');
const serveStatic = require('serve-static');

const app = express();
const buildPath = path.join(__dirname, 'build');

// Enable gzip compression
app.use(compression());

// Serve static files with cache control and immutable directive
app.use(
    serveStatic(buildPath, {
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
            if (/\.(js|css|woff2?|ttf|eot|svg|png|jpe?g|gif|ico)$/.test(filePath)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        },
    })
);

// SPA fallback: serve index.html for any non-static route
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});