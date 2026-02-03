import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, routesMeta } from '../src/routeMeta.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');

const today = new Date().toISOString().split('T')[0];

const urls = routesMeta.filter((route) => {
  if (route.path === '*') return false;
  if (route.includeInSitemap === false) return false;
  return true;
});

const entries = urls.map((route) => {
  const canonicalPath = route.canonicalPath || route.path;
  const loc = `${SITE_URL}${canonicalPath}`;
  const changefreq = route.changefreq || 'monthly';
  const priority = typeof route.priority === 'number' ? route.priority.toFixed(1) : '0.5';

  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `${entries.join('\n')}\n` +
  `</urlset>\n`;

await fs.writeFile(outPath, xml, 'utf8');
