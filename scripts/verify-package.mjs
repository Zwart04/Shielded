import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateExtensionDir } from './validate-extension.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PKG = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));

const TARGETS = [
  { browser: 'chromium', dir: 'dist' },
  { browser: 'firefox', dir: 'dist-firefox' },
];

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

function zipEntries(zipPath) {
  try {
    const output = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch {
    return null;
  }
}

const problems = [];

for (const target of TARGETS) {
  const dir = path.join(ROOT, target.dir);
  if (!(await exists(dir))) {
    problems.push(`${target.dir}/ belum dibangun`);
    continue;
  }

  try {
    await validateExtensionDir(dir, { browser: target.browser, expectVersion: PKG.version });
  } catch (error) {
    problems.push(error.message);
    continue;
  }

  const zipPath = path.join(ROOT, `shielded-${PKG.version}-${target.browser}.zip`);
  if (!(await exists(zipPath))) {
    problems.push(`${path.basename(zipPath)} belum dibuat`);
    continue;
  }

  const entries = zipEntries(zipPath);
  if (entries === null) {
    console.warn(`peringatan: "unzip" tidak tersedia, isi ${path.basename(zipPath)} tidak diperiksa`);
  } else {
    const manifestEntry = `shielded-${PKG.version}-${target.browser}/manifest.json`;
    if (!entries.includes(manifestEntry)) {
      problems.push(`${path.basename(zipPath)} tidak memuat ${manifestEntry}`);
    }
    if (entries.some((entry) => entry === 'manifest.json')) {
      problems.push(`${path.basename(zipPath)} menaruh manifest.json di akar zip (mudah salah pilih folder)`);
    }
  }
}

if (problems.length > 0) {
  console.error('Paket belum siap rilis:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `Paket siap: chromium + firefox, versi ${PKG.version}, manifest di dalam folder masing-masing.`,
);
