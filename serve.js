const fs = require('fs');
const http = require('http');
const path = require('path');

const root = __dirname;
const port = Number(process.argv[2] || 8776);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
};

http.createServer((request, response) => {
  let urlPath = decodeURIComponent(request.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') {
    urlPath = '/index.html';
  }

  const filePath = path.resolve(root, `.${urlPath}`);
  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': types[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Avatar editor site: http://127.0.0.1:${port}/`);
});
