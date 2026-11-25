import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * Pemeriksaan statis sebelum paket dirilis. Menangkap kesalahan yang membuat
 * browser menolak memuat ekstensi ("Tidak dapat memuat manifes"): JSON rusak,
 * berkas yang dirujuk hilang, atau kunci background yang tidak didukung
 * browser tujuan.
 */

const ALLOWED_PERMISSIONS = new Set(['storage', 'scripting']);

function collectReferences(manifest, browser) {
  const refs = [];
  const push = (label, value) => {
    if (typeof value === 'string' && value) refs.push({ label, value });
  };

  push('action.default_popup', manifest.action?.default_popup);

  for (const [size, file] of Object.entries(manifest.icons ?? {})) {
    push(`icons.${size}`, file);
  }
  for (const [size, file] of Object.entries(manifest.action?.default_icon ?? {})) {
    push(`action.default_icon.${size}`, file);
  }

  if (browser === 'firefox') {
    for (const file of manifest.background?.scripts ?? []) {
      push('background.scripts', file);
    }
  } else {
    push('background.service_worker', manifest.background?.service_worker);
  }

  for (const [index, script] of (manifest.content_scripts ?? []).entries()) {
    for (const file of script.js ?? []) push(`content_scripts[${index}].js`, file);
    for (const file of script.css ?? []) push(`content_scripts[${index}].css`, file);
  }

  return refs;
}

function isSafeRelative(ref) {
  if (path.isAbsolute(ref) || ref.startsWith('\\') || /^[a-z]+:/i.test(ref)) return false;
  const normalized = path.posix.normalize(ref);
  return !normalized.startsWith('../') && normalized !== '..';
}

/**
 * @param {string} dir
 * @param {{ browser: 'chromium' | 'firefox', expectVersion?: string }} options
 */
export async function validateExtensionDir(dir, { browser, expectVersion }) {
  const problems = [];
  const manifestPath = path.join(dir, 'manifest.json');
  let raw;

  try {
    raw = await readFile(manifestPath, 'utf8');
  } catch {
    throw new Error(`manifest.json tidak ada di ${dir}`);
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (error) {
    throw new Error(`manifest.json bukan JSON valid: ${error.message}`);
  }

  if (manifest.manifest_version !== 3) problems.push('manifest_version harus 3');
  if (!manifest.name) problems.push('name kosong');
  if (!manifest.description) problems.push('description kosong');
  if (!/^\d+(\.\d+){0,3}$/.test(String(manifest.version ?? ''))) {
    problems.push(`version tidak valid: ${manifest.version}`);
  }
  if (expectVersion && manifest.version !== expectVersion) {
    problems.push(`version ${manifest.version} != package.json ${expectVersion}`);
  }

  const permissions = Array.isArray(manifest.permissions) ? manifest.permissions : [];
  for (const permission of permissions) {
    if (!ALLOWED_PERMISSIONS.has(permission)) {
      problems.push(`izin di luar daftar: ${permission}`);
    }
  }

  const hosts = manifest.host_permissions ?? [];
  if (!Array.isArray(hosts) || hosts.length === 0) {
    problems.push('host_permissions kosong');
  } else {
    for (const host of hosts) {
      if (typeof host !== 'string' || !host.startsWith('https://')) {
        problems.push(`host_permissions tidak https: ${host}`);
      }
    }
  }

  if (browser === 'firefox') {
    if (!Array.isArray(manifest.background?.scripts) || manifest.background.scripts.length === 0) {
      problems.push('Firefox butuh background.scripts (service worker tidak didukung)');
    }
    if (manifest.background?.service_worker) {
      problems.push('Firefox tidak boleh memakai background.service_worker');
    }
    if (!manifest.browser_specific_settings?.gecko?.id) {
      problems.push('Firefox butuh browser_specific_settings.gecko.id');
    }
    if (manifest.minimum_chrome_version) {
      problems.push('minimum_chrome_version hanya untuk Chromium');
    }
  } else {
    if (typeof manifest.background?.service_worker !== 'string') {
      problems.push('Chromium butuh background.service_worker');
    }
    if (manifest.background?.scripts) {
      problems.push('Chromium memakai service_worker, bukan background.scripts');
    }
    if (!manifest.minimum_chrome_version) {
      problems.push('Chromium butuh minimum_chrome_version');
    }
  }

  const csp = manifest.content_security_policy?.extension_pages;
  if (!csp || !csp.includes("script-src 'self'")) {
    problems.push("CSP extension_pages harus memuat script-src 'self'");
  }

  for (const ref of collectReferences(manifest, browser)) {
    if (!isSafeRelative(ref.value)) {
      problems.push(`${ref.label} bukan path relatif aman: ${ref.value}`);
      continue;
    }
    const target = path.join(dir, ...ref.value.split('/'));
    try {
      const info = await stat(target);
      if (!info.isFile()) problems.push(`${ref.label} bukan berkas: ${ref.value}`);
    } catch {
      problems.push(`${ref.label} tidak ditemukan: ${ref.value}`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`Paket ${browser} tidak valid:\n- ${problems.join('\n- ')}`);
  }

  return { manifest, references: collectReferences(manifest, browser) };
}

/** Teks panduan yang ikut masuk ke dalam zip rilis. */
export function installationText({ browser, version, folder }) {
  if (browser === 'firefox') {
    return `SHIELDED ${version} — CARA PASANG (FIREFOX)

1. Ekstrak zip ini. Akan muncul folder: ${folder}
2. Buka about:debugging#/runtime/this-firefox
3. Klik "Load Temporary Add-on..." / "Muat Add-on Sementara..."
4. Pilih berkas manifest.json DI DALAM folder ${folder}
   (bukan file zip, bukan folder di atasnya).
5. Ekstensi langsung aktif sampai Firefox ditutup. Firefox hanya mengizinkan
   add-on bertanda tangan Mozilla untuk pemasangan permanen.

PENTING — IZIN SITUS:
Firefox MV3 meminta izin situs secara opt-in. Bila blur belum muncul:
buka about:addons -> Shielded -> tab Izin/Permissions -> aktifkan akses ke
WhatsApp Web, Telegram Web, Instagram, Facebook, X, Threads, dan TikTok.

Tidak ada koneksi jaringan, tidak ada telemetri. Semua proses lokal.
Lisensi GPL-3.0.
`;
  }

  return `SHIELDED ${version} — CARA PASANG (CHROME, EDGE, BRAVE, OPERA, VIVALDI)

1. Ekstrak zip ini. Akan muncul folder: ${folder}
2. Buka halaman ekstensi:
   - Chrome  : chrome://extensions
   - Edge    : edge://extensions
   - Brave   : brave://extensions
   - Opera   : opera://extensions
   - Vivaldi : vivaldi://extensions
3. Nyalakan "Developer mode" / "Mode pengembang".
4. Klik "Load unpacked" / "Muat yang belum dikemas".
5. Pilih FOLDER ${folder} — folder yang berisi berkas manifest.json ini.

PENTING:
- Jangan pilih file zip. Browser tidak bisa memuat ekstensi dari dalam zip.
- Jangan pilih folder di atasnya. Kalau manifest.json tidak berada tepat di
  folder yang dipilih, browser menampilkan "Tidak dapat memuat manifes."

Tidak ada koneksi jaringan, tidak ada telemetri. Semua proses lokal.
Lisensi GPL-3.0.
`;
}
