export const meta = {
  name: 'seo-meta',
  tier: 1,
  description: 'Required SEO + social meta tags for production sites.',
};

const REQUIRED = [
  { selector: 'html[lang]', message: '<html> must declare a lang attribute' },
  { selector: 'head > title', message: '<title> is missing' },
  { selector: 'meta[name="viewport"]', message: 'viewport meta is missing' },
  { selector: 'meta[name="description"]', message: 'meta description is missing' },
  { selector: 'meta[charset]', message: 'meta charset is missing' },
  { selector: 'link[rel="canonical"]', message: 'canonical link is missing' },
  { selector: 'meta[property="og:title"]', message: 'Open Graph title is missing' },
  { selector: 'meta[property="og:description"]', message: 'Open Graph description is missing' },
  { selector: 'meta[property="og:image"]', message: 'Open Graph image is missing' },
  { selector: 'meta[name="twitter:card"]', message: 'Twitter card meta is missing' },
];

const RECOMMENDED = [
  { selector: 'link[rel~="icon"]', message: 'favicon link is missing' },
  { selector: 'script[type="application/ld+json"]', message: 'JSON-LD structured data is missing' },
  { selector: 'meta[property="og:url"]', message: 'Open Graph URL is missing' },
  { selector: 'meta[property="og:type"]', message: 'Open Graph type is missing' },
];

export default async function run({ dom }) {
  const doc = dom.window.document;
  const errors = [];
  const warnings = [];

  for (const rule of REQUIRED) {
    if (!doc.querySelector(rule.selector)) {
      errors.push({ code: 'missing-required-meta', message: rule.message, selector: rule.selector });
    }
  }

  for (const rule of RECOMMENDED) {
    if (!doc.querySelector(rule.selector)) {
      warnings.push({ code: 'missing-recommended-meta', message: rule.message, selector: rule.selector });
    }
  }

  const title = doc.querySelector('title')?.textContent?.trim() ?? '';
  if (title && (title.length < 15 || title.length > 70)) {
    warnings.push({
      code: 'title-length',
      message: `<title> length ${title.length} is outside recommended 15-70 chars`,
    });
  }

  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '';
  if (description && (description.length < 50 || description.length > 170)) {
    warnings.push({
      code: 'description-length',
      message: `meta description length ${description.length} is outside recommended 50-170 chars`,
    });
  }

  return {
    ...meta,
    passed: errors.length === 0,
    errors,
    warnings,
    stats: {
      errorCount: errors.length,
      warningCount: warnings.length,
      titleLength: title.length,
      descriptionLength: description.length,
    },
  };
}
