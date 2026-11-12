import { build, context } from 'esbuild';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import manifest from '../manifest.config.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const WATCH = process.argv.includes('--watch');

const ENTRIES = [
  { input: 'src/content/main.ts', output: 'content.js', format: 'iife' },
  { input: 'src/background/service-worker.ts', output: 'background.js', format: 'esm' },
  { input: 'src/ui/popup/main.ts', output: 'ui/popup/popup.js', format: 'iife' },
];

const PAGES = ['popup', 'privacy'];

function optionsFor(entry) {
  return {
    entryPoints: [path.join(ROOT, entry.input)],
    outfile: path.join(DIST, entry.output),
    bundle: true,
    format: entry.format,
    platform: 'browser',
    target: ['chrome110'],
    sourcemap: WATCH ? 'inline' : false,
    minify: !WATCH,
    logLevel: 'warning',
  };
}

async function copyStatic() {
  await mkdir(path.join(DIST, 'ui'), { recursive: true });
  await cp(path.join(ROOT, 'src/ui/styles'), path.join(DIST, 'ui/styles'), { recursive: true });
  for (const page of PAGES) {
    await mkdir(path.join(DIST, 'ui', page), { recursive: true });
    await cp(
      path.join(ROOT, 'src/ui', page, 'index.html'),
      path.join(DIST, 'ui', page, 'index.html'),
    );
  }
  await cp(path.join(ROOT, 'public/icons'), path.join(DIST, 'icons'), { recursive: true });
  await cp(path.join(ROOT, 'public/fonts'), path.join(DIST, 'fonts'), { recursive: true });
  await writeFile(path.join(DIST, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  if (WATCH) {
    for (const entry of ENTRIES) {
      const ctx = await context(optionsFor(entry));
      await ctx.watch();
    }
  } else {
    await Promise.all(ENTRIES.map((entry) => build(optionsFor(entry))));
  }

  await copyStatic();
  console.log(`Build selesai: ${DIST}${WATCH ? ' (watch)' : ''}`);
}

await main();
