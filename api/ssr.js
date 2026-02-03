import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const templatePath = path.resolve(rootDir, 'dist/client/index.html');

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const template = await fs.readFile(templatePath, 'utf-8');
    const ssrEntry = new URL('../dist/server/entry-server.js', import.meta.url);
    const { render } = await import(ssrEntry.href);

    const { html, head, status } = render(url.pathname);
    const response = template
      .replace('<!--app-head-->', head)
      .replace('<!--app-html-->', html);

    res.statusCode = status || 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(response);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
