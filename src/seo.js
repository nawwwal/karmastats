import { SITE_URL, DEFAULT_OG_IMAGE } from './routeMeta';

const SITE_NAME = 'KARMASTAT';
const SITE_DESCRIPTION = 'Advanced medical sample size calculators and statistical tools for clinical and epidemiological research.';

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildSchema = ({ title, description, url, kind }) => {
  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL
    }
  };

  const webAppSchema = (kind === 'calculator' || kind === 'tool') ? {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description,
    url,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web'
  } : null;

  const graph = [webSiteSchema, webPageSchema, webAppSchema].filter(Boolean);
  return { '@context': 'https://schema.org', '@graph': graph };
};

export const resolveSeoMeta = (meta = {}) => {
  const title = meta.title || SITE_NAME;
  const description = meta.description || SITE_DESCRIPTION;
  const canonicalUrl = meta.canonicalPath ? `${SITE_URL}${meta.canonicalPath}` : null;
  const ogUrl = canonicalUrl || SITE_URL;
  const ogImage = meta.ogImage ? `${SITE_URL}${meta.ogImage}` : `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  const robots = meta.noindex || meta.nofollow
    ? `${meta.noindex ? 'noindex' : 'index'},${meta.nofollow ? 'nofollow' : 'follow'}`
    : null;

  return {
    title,
    description,
    canonicalUrl,
    ogUrl,
    ogImage,
    robots,
    schema: buildSchema({ title, description, url: ogUrl, kind: meta.kind })
  };
};

export const buildHeadTags = (meta = {}) => {
  const { title, description, canonicalUrl, ogUrl, ogImage, robots, schema } = resolveSeoMeta(meta);

  const tags = [
    `<title data-seo=\"true\">${escapeHtml(title)}</title>`,
    `<meta data-seo=\"true\" name=\"description\" content=\"${escapeHtml(description)}\">`
  ];

  if (canonicalUrl) {
    tags.push(`<link data-seo=\"true\" rel=\"canonical\" href=\"${escapeHtml(canonicalUrl)}\">`);
  }

  if (robots) {
    tags.push(`<meta data-seo=\"true\" name=\"robots\" content=\"${escapeHtml(robots)}\">`);
  }

  tags.push(
    `<meta data-seo=\"true\" property=\"og:type\" content=\"website\">`,
    `<meta data-seo=\"true\" property=\"og:title\" content=\"${escapeHtml(title)}\">`,
    `<meta data-seo=\"true\" property=\"og:description\" content=\"${escapeHtml(description)}\">`,
    `<meta data-seo=\"true\" property=\"og:url\" content=\"${escapeHtml(ogUrl)}\">`,
    `<meta data-seo=\"true\" property=\"og:image\" content=\"${escapeHtml(ogImage)}\">`,
    `<meta data-seo=\"true\" name=\"twitter:card\" content=\"summary_large_image\">`,
    `<meta data-seo=\"true\" name=\"twitter:title\" content=\"${escapeHtml(title)}\">`,
    `<meta data-seo=\"true\" name=\"twitter:description\" content=\"${escapeHtml(description)}\">`,
    `<meta data-seo=\"true\" name=\"twitter:image\" content=\"${escapeHtml(ogImage)}\">`
  );

  tags.push(
    `<script data-seo=\"true\" type=\"application/ld+json\">${escapeHtml(JSON.stringify(schema))}</script>`
  );

  return tags.join('');
};

export const applyMetaToDocument = (meta = {}) => {
  if (typeof document === 'undefined') return;

  const { title, description, canonicalUrl, ogUrl, ogImage, robots, schema } = resolveSeoMeta(meta);
  const head = document.head;

  head.querySelectorAll('[data-seo="true"]').forEach((node) => node.remove());

  const titleEl = document.createElement('title');
  titleEl.setAttribute('data-seo', 'true');
  titleEl.textContent = title;
  head.appendChild(titleEl);

  const addMeta = (attrs) => {
    const metaEl = document.createElement('meta');
    metaEl.setAttribute('data-seo', 'true');
    Object.entries(attrs).forEach(([key, value]) => metaEl.setAttribute(key, value));
    head.appendChild(metaEl);
  };

  addMeta({ name: 'description', content: description });

  if (canonicalUrl) {
    const linkEl = document.createElement('link');
    linkEl.setAttribute('data-seo', 'true');
    linkEl.setAttribute('rel', 'canonical');
    linkEl.setAttribute('href', canonicalUrl);
    head.appendChild(linkEl);
  }

  if (robots) {
    addMeta({ name: 'robots', content: robots });
  }

  addMeta({ property: 'og:type', content: 'website' });
  addMeta({ property: 'og:title', content: title });
  addMeta({ property: 'og:description', content: description });
  addMeta({ property: 'og:url', content: ogUrl });
  addMeta({ property: 'og:image', content: ogImage });
  addMeta({ name: 'twitter:card', content: 'summary_large_image' });
  addMeta({ name: 'twitter:title', content: title });
  addMeta({ name: 'twitter:description', content: description });
  addMeta({ name: 'twitter:image', content: ogImage });

  const scriptEl = document.createElement('script');
  scriptEl.setAttribute('data-seo', 'true');
  scriptEl.setAttribute('type', 'application/ld+json');
  scriptEl.textContent = JSON.stringify(schema);
  head.appendChild(scriptEl);
};
