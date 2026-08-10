import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL, routesMeta } from '../src/routeMeta.js';
import { buildHeadTags } from '../src/seo.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');
const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');

for (const route of routesMeta.filter(({ path: routePath }) => routePath !== '*')) {
  const html = template.replace('<!-- SEO_HEAD -->', buildHeadTags(route));
  const outputPath = route.path === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, route.path.slice(1), 'index.html');

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, 'utf8');
}

const sitemapEntries = routesMeta
  .filter((route) => route.includeInSitemap !== false)
  .map((route) => `  <url><loc>${SITE_URL}${route.path}</loc></url>`)
  .join('\n');

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  sitemapEntries,
  '</urlset>',
  ''
].join('\n');

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

await Promise.all([
  fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8'),
  fs.writeFile(path.join(distDir, 'robots.txt'), robots, 'utf8')
]);
