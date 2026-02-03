import { Helmet } from 'react-helmet-async';
import { SITE_URL, DEFAULT_OG_IMAGE } from '../routeMeta';

const SITE_NAME = 'KARMASTAT';
const SITE_DESCRIPTION = 'Advanced medical sample size calculators and statistical tools for clinical and epidemiological research.';

export function SEO({ meta }) {
  const title = meta?.title || SITE_NAME;
  const description = meta?.description || SITE_DESCRIPTION;
  const canonicalUrl = meta?.canonicalPath ? `${SITE_URL}${meta.canonicalPath}` : null;
  const ogImage = meta?.ogImage ? `${SITE_URL}${meta.ogImage}` : `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  const ogUrl = canonicalUrl || SITE_URL;

  const shouldNoIndex = Boolean(meta?.noindex);
  const shouldNoFollow = Boolean(meta?.nofollow);
  const robotsContent = shouldNoIndex || shouldNoFollow
    ? `${shouldNoIndex ? 'noindex' : 'index'},${shouldNoFollow ? 'nofollow' : 'follow'}`
    : null;

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
    url: ogUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL
    }
  };

  const webAppSchema = (meta?.kind === 'calculator' || meta?.kind === 'tool') ? {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description,
    url: ogUrl,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web'
  } : null;

  const graph = [webSiteSchema, webPageSchema, webAppSchema].filter(Boolean);
  const schemaMarkup = { '@context': 'https://schema.org', '@graph': graph };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      {robotsContent ? <meta name="robots" content={robotsContent} /> : null}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
    </Helmet>
  );
}

export default SEO;
