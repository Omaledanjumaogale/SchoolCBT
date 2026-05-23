// src/lib/seo.ts
// Shared SEO metadata constants for SchoolCBT
// Use in <svelte:head> blocks across all routes

export const SITE = {
  name: 'SchoolCBT',
  url: 'https://schoolcbt.com.ng',
  description: 'Nigeria\'s #1 AI-powered CBT platform for JAMB, WAEC, NECO & NABTEB. Multi-agent AI, predictive pass analytics, tutor matching. Results as a Service.',
  image: 'https://schoolcbt.com.ng/og-image.png',
  twitter: '@SchoolCBT',
  locale: 'en_NG',
  currency: 'NGN'
};

export function ogMeta(page: {
  title: string;
  description: string;
  path?: string;
  type?: string;
}) {
  return `
<meta property="og:title" content="${page.title}" />
<meta property="og:description" content="${page.description}" />
<meta property="og:url" content="${SITE.url}${page.path ?? ''}" />
<meta property="og:image" content="${SITE.image}" />
<meta property="og:type" content="${page.type ?? 'website'}" />
<meta property="og:site_name" content="${SITE.name}" />
<meta property="og:locale" content="${SITE.locale}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${page.title}" />
<meta name="twitter:description" content="${page.description}" />
<meta name="twitter:image" content="${SITE.image}" />
<meta name="twitter:site" content="${SITE.twitter}" />
<link rel="canonical" href="${SITE.url}${page.path ?? ''}" />
  `.trim();
}

export function jsonLDOrganisation() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    description: SITE.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lagos',
      addressCountry: 'NG'
    },
    sameAs: [
      'https://twitter.com/SchoolCBT',
      'https://linkedin.com/company/schoolcbt'
    ]
  });
}

export function jsonLDWebApplication() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE.name,
    url: SITE.url,
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Web, Android, iOS',
    description: SITE.description,
    offers: {
      '@type': 'Offer',
      price: '10000',
      priceCurrency: 'NGN'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '50000',
      bestRating: '5'
    }
  });
}

export function jsonLDBreadcrumb(items: { name: string; url: string }[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.url}`
    }))
  });
}
