// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    let { pathname, query } = parsedUrl;

    // Check if the URL contains &data=
    if (pathname.includes('&data=')) {
      const parts = pathname.split('&data=');
      pathname = parts[0] || '/';
      query.data = parts[1];
    }

    // Handle the request
    handle(req, res, parsedUrl);
  }).listen(15010, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});