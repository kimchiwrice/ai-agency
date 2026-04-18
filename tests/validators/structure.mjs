export const meta = {
  name: 'structure',
  tier: 1,
  description: 'Required page structure — nav, footer, exactly one <h1>, no lorem ipsum, no unfilled placeholders.',
};

export default async function run({ dom, html }) {
  const doc = dom.window.document;
  const errors = [];
  const warnings = [];

  if (!doc.querySelector('nav')) errors.push({ code: 'missing-nav', message: '<nav> element is missing' });
  if (!doc.querySelector('footer')) errors.push({ code: 'missing-footer', message: '<footer> element is missing' });
  if (!doc.querySelector('main')) {
    warnings.push({ code: 'missing-main', message: '<main> landmark missing (a11y)' });
  }

  const h1s = doc.querySelectorAll('h1');
  if (h1s.length === 0) {
    errors.push({ code: 'no-h1', message: 'Page has no <h1> — required for SEO and a11y outline' });
  } else if (h1s.length > 1) {
    warnings.push({ code: 'multiple-h1', message: `Page has ${h1s.length} <h1> tags — best practice is one per page` });
  }

  if (/\{\{\s*[A-Z_]+\s*\}\}/.test(html)) {
    const samples = [...html.matchAll(/\{\{[^}]+\}\}/g)].slice(0, 5).map((m) => m[0]);
    errors.push({
      code: 'unresolved-placeholder',
      message: `Unresolved template placeholders present: ${samples.join(', ')}`,
    });
  }

  if (/lorem ipsum/i.test(html)) {
    errors.push({ code: 'lorem-ipsum', message: 'Lorem ipsum placeholder copy is present — not production-ready' });
  }

  const injection = [...html.matchAll(/<!--\s*([A-Za-z]+)\s+fills these\s*-->/gi)];
  if (injection.length > 0) {
    warnings.push({
      code: 'agent-injection-marker',
      message: `${injection.length} agent injection marker(s) still in HTML (e.g., <!-- designer fills these -->)`,
    });
  }

  return {
    ...meta,
    passed: errors.length === 0,
    errors,
    warnings,
    stats: {
      h1Count: h1s.length,
      hasNav: !!doc.querySelector('nav'),
      hasFooter: !!doc.querySelector('footer'),
      hasMain: !!doc.querySelector('main'),
    },
  };
}
