import { HtmlValidate, formatterFactory } from 'html-validate';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, '..', '.htmlvalidate.json');

let cachedValidator;
async function getValidator() {
  if (cachedValidator) return cachedValidator;
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  cachedValidator = new HtmlValidate({ root: true, ...config });
  return cachedValidator;
}

export const meta = {
  name: 'html-validate',
  tier: 1,
  description: 'W3C-style HTML validity — duplicate IDs, bad nesting, missing required attrs.',
};

export default async function run({ htmlPath, html }) {
  const validator = await getValidator();
  const report = await validator.validateString(html, htmlPath);

  const errors = [];
  const warnings = [];
  for (const result of report.results) {
    for (const msg of result.messages) {
      const entry = {
        code: msg.ruleId,
        message: msg.message,
        line: msg.line,
        column: msg.column,
        selector: msg.selector ?? null,
      };
      if (msg.severity >= 2) errors.push(entry);
      else warnings.push(entry);
    }
  }

  return {
    ...meta,
    passed: errors.length === 0,
    errors,
    warnings,
    stats: { errorCount: errors.length, warningCount: warnings.length },
  };
}
