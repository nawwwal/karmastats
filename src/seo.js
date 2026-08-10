import { SITE_URL } from './routeMeta.js';

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export function resolveSeoMeta(meta) {
  return {
    title: meta.title,
    description: meta.description,
    canonicalUrl: meta.canonicalPath ? `${SITE_URL}${meta.canonicalPath}` : null,
    robots: meta.noindex ? 'noindex,follow' : 'index,follow'
  };
}

export function buildHeadTags(meta) {
  const { title, description, canonicalUrl, robots } = resolveSeoMeta(meta);
  const tags = [
    `<title data-seo="true">${escapeHtml(title)}</title>`,
    `<meta data-seo="true" name="description" content="${escapeHtml(description)}">`,
    `<meta data-seo="true" name="robots" content="${robots}">`,
    '<meta data-seo="true" property="og:type" content="website">',
    `<meta data-seo="true" property="og:title" content="${escapeHtml(title)}">`,
    `<meta data-seo="true" property="og:description" content="${escapeHtml(description)}">`,
    `<meta data-seo="true" property="og:url" content="${escapeHtml(canonicalUrl ?? SITE_URL)}">`
  ];

  if (canonicalUrl) {
    tags.push(`<link data-seo="true" rel="canonical" href="${escapeHtml(canonicalUrl)}">`);
  }

  return tags.join('\n    ');
}

export function applyMetaToDocument(meta) {
  const head = document.head;
  const template = document.createElement('template');
  template.innerHTML = buildHeadTags(meta);

  head.querySelectorAll('[data-seo="true"]').forEach((node) => node.remove());
  head.append(template.content);
}
