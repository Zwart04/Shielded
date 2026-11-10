import { el } from '../../components/dom.ts';
import type { SectionContext } from './shared.ts';
import { card, pageHead } from './shared.ts';
import { icon } from '../../components/icons.ts';
import { REPO_URL, SUPPORT_LABEL, SUPPORT_URL } from '../../../shared/links.ts';

function list(items: readonly string[]): HTMLElement {
  const ul = el('ul', { className: 'plain-list' });
  for (const item of items) ul.append(el('li', { text: item }));
  return ul;
}

export function renderAbout(_ctx: SectionContext): HTMLElement {
  const wrap = el('div');
  const version = chrome.runtime.getManifest().version;

  wrap.append(pageHead('Tentang', 'Cara kerja Shielded dan batas perlindungannya.'));

  wrap.append(
    card('Shielded', `Versi ${version}`, [
      el('p', {
        text: 'Ekstensi privasi visual untuk antarmuka pesan web. Semua pemrosesan terjadi di perangkat Anda; tidak ada server dan tidak ada pengumpulan data.',
      }),
    ]),
  );

  wrap.append(
    card('Yang dilakukan dan tidak dilakukan', 'Pernyataan ini berlaku untuk seluruh fitur.', [
      el('h3', { text: 'Yang dilakukan' }),
      list([
        'Mengaburkan atau menutup elemen yang Anda pilih di layar.',
        'Menyimpan preferensi tampilan secara lokal.',
        'Bekerja tanpa akun dan tanpa koneksi ke server.',
      ]),
      el('h3', { text: 'Yang tidak dilakukan' }),
      list([
        'Membaca, menyimpan, atau mengirim isi pesan.',
        'Mengubah pengiriman atau penerimaan pesan platform.',
        'Melindungi dari tangkapan layar, berbagi layar, atau pembaca layar.',
        'Menggantikan enkripsi atau keamanan akun.',
      ]),
    ]),
  );

  wrap.append(
    card('Izin yang digunakan', 'Tidak ada izin di luar daftar ini.', [
      list([
        'storage — menyimpan preferensi lokal.',
        'Akses situs — menjalankan skrip visual di platform yang didukung.',
      ]),
      el('p', {
        className: 'small',
        text: 'Pintasan keyboard dideklarasikan lewat manifest commands dan tidak menambah izin.',
      }),
    ]),
  );

  wrap.append(
    card('Batas perlindungan', 'Penting untuk dipahami sebelum mengandalkan fitur ini.', [
      el('p', {
        text: 'Shielded melindungi tampilan visual di layar browser. Shielded tidak melindungi dari tangkapan layar, rekaman layar, berbagi layar, pembaca layar, DevTools, salin-tempel, atau akses fisik ke perangkat.',
      }),
    ]),
  );

  const privacyLink = el('a', {
    text: 'Baca kebijakan privasi',
    attrs: { href: '../privacy/index.html', target: '_blank', rel: 'noopener noreferrer' },
  });

  wrap.append(card('Privasi', 'Rincian data dan izin.', [privacyLink]));

  const support = el(
    'a',
    {
      className: 'btn btn-support',
      attrs: { href: SUPPORT_URL, target: '_blank', rel: 'noopener noreferrer' },
    },
    [icon('coffee', 16), el('span', { text: SUPPORT_LABEL })],
  );
  const repo = el('a', {
    text: 'Lihat kode sumber di GitHub',
    attrs: { href: REPO_URL, target: '_blank', rel: 'noopener noreferrer' },
  });

  wrap.append(
    card('Dukung pengembangan', 'Shielded gratis dan tanpa telemetri.', [
      el('p', {
        className: 'small',
        text: 'Kalau ekstensi ini membantu, Anda bisa mentraktir kopi lewat Tako. Tidak wajib, tidak mengubah fitur apa pun.',
      }),
      support,
      el('p', { className: 'small' }, [repo]),
    ]),
  );

  return wrap;
}
