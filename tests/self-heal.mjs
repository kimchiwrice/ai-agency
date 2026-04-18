#!/usr/bin/env node
/**
 * Self-heal loop: when validators fail, ask Claude for a patched index.html
 * and re-run until all Tier-1 validators pass or we hit the iteration cap.
 *
 * Usage:
 *   node tests/self-heal.mjs                       heal all failing projects
 *   node tests/self-heal.mjs --project paws-and-co heal one project
 *   node tests/self-heal.mjs --dry                 show the diff, don't write
 *   MAX_ITER=5 node tests/self-heal.mjs            override iteration cap
 *
 * Requires ANTHROPIC_API_KEY in env.
 */
import { readFile, writeFile, copyFile, readdir, stat, mkdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import Anthropic from '@anthropic-ai/sdk';

import htmlValidator, { meta as htmlMeta } from './validators/html-validate.mjs';
import seoValidator, { meta as seoMeta } from './validators/seo-meta.mjs';
import assetsValidator, { meta as assetsMeta } from './validators/assets.mjs';
import structureValidator, { meta as structureMeta } from './validators/structure.mjs';
import linksValidator, { meta as linksMeta } from './validators/links.mjs';

const VALIDATORS = [
  { run: htmlValidator, meta: htmlMeta },
  { run: seoValidator, meta: seoMeta },
  { run: assetsValidator, meta: assetsMeta },
  { run: structureValidator, meta: structureMeta },
  { run: linksValidator, meta: linksMeta },
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'output');
const BACKUP_DIR = resolve(ROOT, 'tests', '.heal-backups');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry');
const projectArgIdx = args.indexOf('--project');
const projectFilter = projectArgIdx >= 0 ? args[projectArgIdx + 1] : null;
const MAX_ITER = Number(process.env.MAX_ITER ?? 3);
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are the site-repair agent for Trinh Media's AI website agency.
You receive a single-file index.html and a list of validator failures.
Return a corrected full HTML file. Rules:
1. Fix ONLY the listed failures. Do not redesign, rewrite copy, or restyle.
2. Preserve every existing element, inline style, script, and class.
3. Honor the design system in CLAUDE.md (dark forest #0D1F0D, copper #A67C52, cream #E5E0D5).
4. Output a single fenced code block beginning with \`\`\`html and ending with \`\`\`. No prose before or after.
5. If a fix requires information you don't have (missing real URL, real image), use a clearly reasonable placeholder and add an HTML comment <!-- HEAL: needs human review --> next to it.`;

function log(...parts) {
  console.log(...parts);
}

async function discoverProjects() {
  const entries = await readdir(OUTPUT, { withFileTypes: true });
  const projects = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (projectFilter && entry.name !== projectFilter) continue;
    const htmlPath = join(OUTPUT, entry.name, 'index.html');
    try {
      await stat(htmlPath);
      projects.push({ name: entry.name, htmlPath });
    } catch {}
  }
  return projects;
}

async function runValidators(project) {
  const html = await readFile(project.htmlPath, 'utf8');
  const dom = new JSDOM(html, { url: `https://trinh.media/${project.name}/` });
  const ctx = { projectName: project.name, htmlPath: project.htmlPath, html, dom };
  const reports = [];
  for (const { run, meta } of VALIDATORS) {
    try {
      reports.push(await run(ctx));
    } catch (err) {
      reports.push({ ...meta, passed: false, errors: [{ code: 'validator-crash', message: err.message }], warnings: [] });
    }
  }
  dom.window.close();
  return { html, reports };
}

function failuresFromReports(reports) {
  const blockers = reports.filter((r) => r.tier === 1 && !r.passed);
  const all = [];
  for (const r of blockers) {
    for (const e of r.errors) {
      all.push({ validator: r.name, code: e.code, message: e.message, line: e.line, selector: e.selector });
    }
  }
  return all;
}

function buildUserPrompt(project, html, failures) {
  const grouped = failures.reduce((acc, f) => {
    acc[f.validator] = acc[f.validator] ?? [];
    acc[f.validator].push(f);
    return acc;
  }, {});
  const failureSection = Object.entries(grouped)
    .map(([validator, items]) => {
      const lines = items.map((i) => {
        const loc = i.line ? ` (line ${i.line})` : '';
        const sel = i.selector ? ` [${i.selector}]` : '';
        return `  - [${i.code}]${loc}${sel}: ${i.message}`;
      });
      return `### ${validator}\n${lines.join('\n')}`;
    })
    .join('\n\n');

  return `Project: ${project.name}
Validator failures (${failures.length}):

${failureSection}

Current index.html:
\`\`\`html
${html}
\`\`\`

Return the corrected file as a single fenced \`\`\`html block.`;
}

function extractHtml(responseText) {
  const match = responseText.match(/```html\n([\s\S]*?)```/);
  if (match) return match[1];
  const plain = responseText.match(/```\n([\s\S]*?)```/);
  if (plain) return plain[1];
  throw new Error('Model response did not contain a fenced html code block');
}

async function callClaude(client, userPrompt) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  return { text, usage: response.usage };
}

async function backup(project, iter) {
  await mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = join(BACKUP_DIR, `${project.name}__iter${iter}__${stamp}.html`);
  await copyFile(project.htmlPath, dest);
  return dest;
}

async function healProject(project, client) {
  log(`\n=== heal: ${project.name} ===`);
  const trace = { project: project.name, iterations: [], finalStatus: 'unknown' };

  for (let iter = 1; iter <= MAX_ITER; iter++) {
    const { html, reports } = await runValidators(project);
    const failures = failuresFromReports(reports);
    const warningsCount = reports.reduce((s, r) => s + r.warnings.length, 0);

    if (failures.length === 0) {
      log(`iter ${iter}: PASS (Tier 1 clean, ${warningsCount} warnings remain)`);
      trace.iterations.push({ iter, action: 'none', failuresBefore: 0 });
      trace.finalStatus = 'healed';
      return trace;
    }

    log(`iter ${iter}: ${failures.length} Tier-1 failure(s); asking Claude for a patch...`);
    const userPrompt = buildUserPrompt(project, html, failures);
    const { text, usage } = await callClaude(client, userPrompt);

    let newHtml;
    try {
      newHtml = extractHtml(text);
    } catch (err) {
      log(`iter ${iter}: model response unparseable — ${err.message}`);
      trace.iterations.push({ iter, failuresBefore: failures.length, error: err.message });
      trace.finalStatus = 'parse-error';
      return trace;
    }

    if (newHtml.length < html.length * 0.5) {
      log(`iter ${iter}: rejected patch (shrunk from ${html.length} to ${newHtml.length} chars)`);
      trace.iterations.push({ iter, failuresBefore: failures.length, error: 'patch-too-small', sizeBefore: html.length, sizeAfter: newHtml.length });
      trace.finalStatus = 'rejected-patch';
      return trace;
    }

    if (dryRun) {
      log(`iter ${iter}: [dry-run] would write ${newHtml.length} chars (was ${html.length})`);
      trace.iterations.push({ iter, failuresBefore: failures.length, dry: true, usage });
      trace.finalStatus = 'dry-run';
      return trace;
    }

    const backupPath = await backup(project, iter);
    await writeFile(project.htmlPath, newHtml);
    log(`iter ${iter}: wrote patch (${newHtml.length} chars); backup at ${backupPath.replace(ROOT + '/', '')}`);
    trace.iterations.push({ iter, failuresBefore: failures.length, usage, backupPath });
  }

  const { reports: finalReports } = await runValidators(project);
  const finalFailures = failuresFromReports(finalReports);
  trace.finalStatus = finalFailures.length === 0 ? 'healed' : 'exhausted';
  trace.residualFailures = finalFailures;
  log(`final: ${trace.finalStatus} (${finalFailures.length} residual Tier-1 failures)`);
  return trace;
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set. Export it before running self-heal.');
    process.exit(2);
  }

  const projects = await discoverProjects();
  if (projects.length === 0) {
    console.error(`No projects found${projectFilter ? ` matching "${projectFilter}"` : ''}.`);
    process.exit(2);
  }

  const client = new Anthropic({ apiKey });
  const traces = [];
  for (const project of projects) {
    traces.push(await healProject(project, client));
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    model: MODEL,
    maxIterations: MAX_ITER,
    dryRun,
    traces,
  };
  await mkdir(BACKUP_DIR, { recursive: true });
  const path = join(BACKUP_DIR, `heal-run-${Date.now()}.json`);
  await writeFile(path, JSON.stringify(summary, null, 2) + '\n');
  log(`\nheal log: ${path.replace(ROOT + '/', '')}`);

  const unhealed = traces.filter((t) => t.finalStatus !== 'healed' && t.finalStatus !== 'dry-run');
  process.exit(unhealed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('self-heal crashed:', err);
  process.exit(2);
});
