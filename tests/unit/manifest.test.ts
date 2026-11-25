import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { EXTENSION_VERSION, createManifest } from '../../manifest.config.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');

/**
 * Bentuk longgar agar satu berkas uji bisa memeriksa manifest Chromium dan
 * Firefox, yang sengaja berbeda pada kunci `background`.
 */
interface ManifestLike {
  manifest_version: number;
  version: string;
  permissions: readonly string[];
  host_permissions: readonly string[];
  content_security_policy: { extension_pages: string };
  background: { type?: string; service_worker?: string; scripts?: string[] };
  minimum_chrome_version?: string;
  browser_specific_settings?: { gecko: { id: string } };
  action: { default_popup: string; default_icon: Record<string, string> };
  icons: Record<string, string>;
}

function manifestFor(browser: 'chromium' | 'firefox'): ManifestLike {
  return createManifest(browser) as unknown as ManifestLike;
}

async function exists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

test('versi manifest sama dengan package.json', async () => {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8')) as {
    version: string;
  };
  assert.equal(pkg.version, EXTENSION_VERSION);
  assert.equal(manifestFor('chromium').version, EXTENSION_VERSION);
  assert.equal(manifestFor('firefox').version, EXTENSION_VERSION);
});

test('manifest chromium memakai service worker ESM', () => {
  const manifest = manifestFor('chromium');
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.background, {
    service_worker: 'background.js',
    type: 'module',
  });
  assert.ok(manifest.minimum_chrome_version);
  assert.equal(manifest.browser_specific_settings, undefined);
});

test('manifest firefox memakai event page, bukan service worker', () => {
  const manifest = manifestFor('firefox');
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.background, { scripts: ['background.js'] });
  assert.equal(manifest.minimum_chrome_version, undefined);
  assert.equal(manifest.browser_specific_settings?.gecko.id, 'shielded@zwart04.github.io');
});

test('setiap manifest merujuk berkas yang benar-benar ada', async () => {
  for (const browser of ['chromium', 'firefox'] as const) {
    const manifest = manifestFor(browser);
    const refs = [
      manifest.action.default_popup,
      manifest.background.scripts?.[0] ?? manifest.background.service_worker,
      ...Object.values(manifest.icons),
      ...Object.values(manifest.action.default_icon),
    ].filter((ref): ref is string => typeof ref === 'string');

    for (const ref of refs) {
      // Background/popup dibuat saat build; ikon berasal dari public/icons.
      const built = path.join(ROOT, 'dist', ref);
      const source = path.join(ROOT, 'public', ref);
      assert.ok(
        (await exists(built)) || (await exists(source)),
        `${browser}: ${ref} tidak ada di dist maupun public`,
      );
    }
  }
});

test('izin tetap minimal di kedua target', () => {
  for (const browser of ['chromium', 'firefox'] as const) {
    const manifest = manifestFor(browser);
    assert.deepEqual([...manifest.permissions].sort(), ['scripting', 'storage']);
    assert.ok(manifest.host_permissions.every((host) => host.startsWith('https://')));
    assert.ok(manifest.content_security_policy.extension_pages.includes("script-src 'self'"));
  }
});
