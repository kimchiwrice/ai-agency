import { LinkChecker } from 'linkinator';

export const meta = {
  name: 'links',
  tier: 2,
  description: 'Broken internal anchors, dead href/src targets. External HTTP checks opt-in via CHECK_EXTERNAL=1.',
};

const CHECK_EXTERNAL = process.env.CHECK_EXTERNAL === '1';

export default async function run({ htmlPath, dom }) {
  const doc = dom.window.document;
  const errors = [];
  const warnings = [];

  const anchors = [...doc.querySelectorAll('a[href^="#"]')];
  const ids = new Set([...doc.querySelectorAll('[id]')].map((el) => el.id));
  for (const a of anchors) {
    const href = a.getAttribute('href');
    if (!href || href === '#') {
      warnings.push({ code: 'empty-anchor', message: `<a> has placeholder href="${href}"` });
      continue;
    }
    const id = href.slice(1);
    if (!ids.has(id)) {
      errors.push({ code: 'broken-anchor', message: `<a href="${href}"> points to missing #${id}` });
    }
  }

  if (!CHECK_EXTERNAL) {
    return {
      ...meta,
      passed: errors.length === 0,
      errors,
      warnings,
      stats: { anchorsChecked: anchors.length, externalChecked: false },
    };
  }

  const checker = new LinkChecker();
  const result = await checker.check({
    path: htmlPath,
    recurse: false,
    timeout: 10000,
    retry: true,
    concurrency: 20,
  });
  let externalBroken = 0;
  for (const link of result.links) {
    if (link.state === 'BROKEN') {
      externalBroken += 1;
      errors.push({
        code: 'broken-link',
        message: `${link.status ?? 'ERR'} on ${link.url}`,
      });
    }
  }

  return {
    ...meta,
    passed: errors.length === 0,
    errors,
    warnings,
    stats: {
      anchorsChecked: anchors.length,
      externalChecked: true,
      externalBroken,
      totalLinks: result.links.length,
    },
  };
}
