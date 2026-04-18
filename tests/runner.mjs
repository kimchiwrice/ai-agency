#!/usr/bin/env node
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

import htmlValidator, { meta as htmlMeta } from './validators/html-validate.mjs';
import seoValidator, { meta as seoMeta } from './validators/seo-meta.mjs';
import assetsValidator, { meta as assetsMeta } from './validators/assets.mjs';
import structureValidator, { meta as structureMeta } from './validators/structure.mjs';
import linksValidator, { meta as linksMeta } from './validators/links.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'output');

const VALIDATORS = [
  { run: htmlValidator, meta: htmlMeta },
  { run: seoValidator, meta: seoMeta },
  { run: assetsValidator, meta: assetsMeta },
  { run: structureValidator, meta: structureMeta },
  { run: linksValidator, meta: linksMeta },
];

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const quietMode = args.includes('--quiet') || jsonMode;
const projectArgIdx = args.indexOf('--project');
const projectFilter = projectArgIdx >= 0 ? args[projectArgIdx + 1] : null;

function color(code, str) {
  if (!process.stdout.isTTY) return str;
  return `\x1b[${code}m${str}\x1b[0m`;
}
const red = (s) => color('31', s);
const green = (s) => color('32', s);
const yellow = (s) => color('33', s);
const cyan = (s) => color('36', s);
const dim = (s) => color('2', s);

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
  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

function log(...parts) {
  if (!quietMode) console.log(...parts);
}

async function runProject(project) {
  const html = await readFile(project.htmlPath, 'utf8');
  const dom = new JSDOM(html, { url: `https://trinh.media/${project.name}/` });
  const ctx = { projectName: project.name, htmlPath: project.htmlPath, html, dom };

  const reports = [];
  for (const { run, meta } of VALIDATORS) {
    const started = Date.now();
    try {
      const report = await run(ctx);
      report.durationMs = Date.now() - started;
      reports.push(report);
    } catch (err) {
      reports.push({
        ...meta,
        passed: false,
        errors: [{ code: 'validator-crash', message: err.message, stack: err.stack }],
        warnings: [],
        stats: {},
        durationMs: Date.now() - started,
      });
    }
  }

  dom.window.close();

  const tier1Failed = reports.some((r) => r.tier === 1 && !r.passed);
  const totalErrors = reports.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = reports.reduce((sum, r) => sum + r.warnings.length, 0);

  const summary = {
    project: project.name,
    timestamp: new Date().toISOString(),
    passed: !tier1Failed,
    shipBlocked: tier1Failed,
    totals: {
      errors: totalErrors,
      warnings: totalWarnings,
      validators: reports.length,
      validatorsPassed: reports.filter((r) => r.passed).length,
    },
    reports,
  };

  const qualityPath = join(dirname(project.htmlPath), '.quality.json');
  await writeFile(qualityPath, JSON.stringify(summary, null, 2) + '\n');

  return summary;
}

function printSummary(summary) {
  const icon = summary.passed ? green('PASS') : red('FAIL');
  log(`\n${icon} ${cyan(summary.project)}  ${dim(`${summary.totals.errors} errors, ${summary.totals.warnings} warnings`)}`);
  for (const report of summary.reports) {
    const badge = report.passed ? green('ok  ') : red('fail');
    const tierTag = dim(`T${report.tier}`);
    log(`  ${badge} ${tierTag} ${report.name.padEnd(14)} ${dim(`${report.errors.length}E ${report.warnings.length}W  ${report.durationMs}ms`)}`);
    for (const err of report.errors.slice(0, 5)) {
      log(`       ${red('-')} ${err.code}: ${err.message}`);
    }
    if (report.errors.length > 5) log(dim(`       ...and ${report.errors.length - 5} more`));
  }
}

async function main() {
  const projects = await discoverProjects();
  if (projects.length === 0) {
    console.error(red(`No projects found in ${OUTPUT}${projectFilter ? ` (filter: ${projectFilter})` : ''}`));
    process.exit(2);
  }
  log(cyan(`AI Agency — validating ${projects.length} project(s)`));

  const summaries = [];
  for (const project of projects) {
    const summary = await runProject(project);
    summaries.push(summary);
    printSummary(summary);
  }

  const anyFailed = summaries.some((s) => !s.passed);
  const agencySummary = {
    generatedAt: new Date().toISOString(),
    projectsValidated: summaries.length,
    projectsPassed: summaries.filter((s) => s.passed).length,
    projectsFailed: summaries.filter((s) => !s.passed).length,
    projects: summaries.map((s) => ({
      name: s.project,
      passed: s.passed,
      errors: s.totals.errors,
      warnings: s.totals.warnings,
    })),
  };

  if (jsonMode) {
    process.stdout.write(JSON.stringify({ summary: agencySummary, details: summaries }, null, 2) + '\n');
  } else {
    log('');
    log(cyan('Agency totals:'));
    log(`  passed: ${green(agencySummary.projectsPassed)}  failed: ${anyFailed ? red(agencySummary.projectsFailed) : 0}`);
    log(dim(`  per-project reports written to output/<project>/.quality.json`));
  }

  process.exit(anyFailed ? 1 : 0);
}

main().catch((err) => {
  console.error(red('Runner crashed:'), err);
  process.exit(2);
});
