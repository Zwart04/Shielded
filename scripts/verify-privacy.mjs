import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

// `scripting` hanya dipakai menyuntik content.js ke tab yang sudah terbuka
// saat ekstensi baru dipasang/di-reload, supaya tidak perlu refresh halaman.
const ALLOWED_PERMISSIONS = new Set(['storage', 'scripting']);
const EXPECTED_HOSTS = new Set([
  'web.whatsapp.com',
  'web.telegram.org',
  'www.instagram.com',
  'instagram.com',
  'www.facebook.com',
  'facebook.com',
  'web.facebook.com',
  'www.messenger.com',
  'messenger.com',
  'x.com',
  'www.x.com',
  'twitter.com',
  'www.twitter.com',
  'www.threads.net',
  'threads.net',
  'www.threads.com',
  'threads.com',
  'www.tiktok.com',
  'tiktok.com',
]);

const FORBIDDEN_PATTERNS = [
  { regex: /\bfetch\s*\(/, label: 'fetch()' },
  { regex: /XMLHttpRequest/, label: 'XMLHttpRequest' },
  { regex: /new\s+WebSocket/, label: 'WebSocket' },
  { regex: /sendBeacon/, label: 'sendBeacon' },
  { regex: /\beval\s*\(/, label: 'eval()' },
  { regex: /new\s+Function\s*\(/, label: 'new Function()' },
  { regex: /import\s*\(\s*['"]https?:/, label: 'dynamic import jarak jauh' },
];

const findings = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
  }
  return files;
}

function checkManifest(manifest, browser) {
  const permissions = manifest.permissions ?? [];
  for (const permission of permissions) {
    if (!ALLOWED_PERMISSIONS.has(permission)) {
      findings.push(`Permission tidak diizinkan: ${permission}`);
    }
  }

  const hosts = manifest.host_permissions ?? [];
  if (hosts.includes('<all_urls>')) {
    findings.push('Manifest memuat <all_urls>');
  }

  for (const pattern of hosts) {
    if (!pattern.startsWith('https://')) {
      findings.push(`Host permission bukan https: ${pattern}`);
      continue;
    }
    const host = pattern.replace('https://', '').replace('/*', '');
    if (!EXPECTED_HOSTS.has(host)) {
      findings.push(`Host permission di luar daftar: ${host}`);
    }
  }

  const scripts = manifest.content_scripts ?? [];
  const declared = new Set(scripts.flatMap((script) => script.matches ?? []));
  for (const pattern of hosts) {
    if (!declared.has(pattern)) {
      findings.push(`Host permission tanpa content script: ${pattern}`);
    }
  }

  if (browser === 'firefox') {
    if (!Array.isArray(manifest.background?.scripts)) {
      findings.push('Firefox harus memakai background.scripts');
    }
    if (manifest.background?.service_worker) {
      findings.push('Firefox tidak boleh memakai service worker');
    }
  } else if (manifest.background?.type !== 'module') {
    findings.push('Background worker Chromium seharusnya bertipe module');
  }

  if (manifest.minimum_chrome_version && browser === 'firefox') {
    findings.push('minimum_chrome_version tidak berlaku di Firefox');
  }
}

async function main() {
  const targets = [
    { browser: 'chromium', dir: DIST },
    { browser: 'firefox', dir: path.join(ROOT, 'dist-firefox') },
  ];

  let scanned = 0;
  let hostCount = 0;

  for (const target of targets) {
    try {
      await stat(target.dir);
    } catch {
      if (target.browser === 'firefox') continue;
      console.error('Folder dist belum ada. Jalankan "npm run build" lebih dulu.');
      process.exit(1);
    }

    const manifest = JSON.parse(await readFile(path.join(target.dir, 'manifest.json'), 'utf8'));
    checkManifest(manifest, target.browser);
    hostCount = Math.max(hostCount, manifest.host_permissions?.length ?? 0);

    const files = await walk(target.dir);
    scanned += files.length;
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const { regex, label } of FORBIDDEN_PATTERNS) {
        if (regex.test(source)) {
          findings.push(`${label} ditemukan di ${path.relative(target.dir, file)}`);
        }
      }
      if (/https?:\/\//.test(source) && /(?:fetch|src\s*=|href\s*=)/.test(source)) {
        findings.push(`Referensi URL eksternal mencurigakan di ${path.relative(target.dir, file)}`);
      }
    }
  }

  if (findings.length > 0) {
    console.error('Audit privasi GAGAL:');
    for (const finding of findings) console.error(` - ${finding}`);
    process.exit(1);
  }

  console.log(`Audit privasi lolos: ${scanned} file JS, ${hostCount} host permission.`);
}

await main();
