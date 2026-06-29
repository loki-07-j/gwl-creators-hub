import { Helmet } from 'react-helmet-async';

const SITE = 'GWL Creators Hub';
const DEFAULT_DESC =
  'Premium digital products for creators — luxury HQ videos, 3,500+ AI-ready business ideas, 141 website templates, a 1TB+ research library and productivity shortcuts. One-time purchase, lifetime access.';
const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://gwlhub.com';

interface SeoProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/** Centralised <head> SEO: title, description, canonical, Open Graph, Twitter + optional JSON-LD. */
export function Seo({ title, description = DEFAULT_DESC, path = '/', image = '/assets/gwl-logo.png', noindex = false, jsonLd }: SeoProps) {
  const fullTitle = title.includes(SITE) ? title : `${title} — ${SITE}`;
  const url = `${ORIGIN}${path}`;
  const img = image.startsWith('http') ? image : `${ORIGIN}${image}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex
        ? <meta name="robots" content="noindex,nofollow" />
        : <meta name="robots" content="index,follow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
