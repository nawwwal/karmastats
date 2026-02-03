import fs from 'node:fs/promises';
import path from 'node:path';

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // In Vercel serverless functions, process.cwd() is usually the root of the project
    // when 'includeFiles' is used correctly.
    const projectRoot = process.cwd();
    const templatePath = path.resolve(projectRoot, 'dist/index.html');
    const ssrEntryPath = path.resolve(projectRoot, 'dist/server/entry-server.js');

    // Debug logging to help identify path issues in Vercel logs
    console.log('Project Root:', projectRoot);
    console.log('Template Path:', templatePath);
    console.log('SSR Entry Path:', ssrEntryPath);

    const template = await fs.readFile(templatePath, 'utf-8');

    // Dynamic import needs a file URL
    const { render } = await import(`file://${ssrEntryPath}`);

    const { html, head, status } = render(url.pathname);
    const response = template
      .replace('<!--app-head-->', head)
      .replace('<!--app-html-->', html);

    res.statusCode = status || 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(response);
  } catch (error) {
    console.error('SSR Error:', error);
    // Attempt to read directory to see what's there
    try {
      const rootFiles = await fs.readdir(process.cwd());
      console.error('Root files:', rootFiles);
      if (rootFiles.includes('dist')) {
        const distFiles = await fs.readdir(path.join(process.cwd(), 'dist'));
        console.error('Dist files:', distFiles);
      }
    } catch (e) {
      console.error('Error listing files:', e);
    }

    res.statusCode = 500;
    res.end(`Internal Server Error: ${error.message}`);
  }
}
