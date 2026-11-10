import { el } from './dom.ts';
import { icon, type IconName } from './icons.ts';
import { brandLogo } from './logo.ts';
import { SUPPORT_LABEL, SUPPORT_URL } from '../../shared/links.ts';

export interface NavItem {
  id: string;
  label: string;
  icon?: IconName;
}

export interface Shell {
  root: HTMLElement;
  content: HTMLElement;
  setActive: (id: string) => void;
}

export function createShell(items: readonly NavItem[], onNavigate: (id: string) => void): Shell {
  const nav = el('nav', { className: 'nav', attrs: { 'aria-label': 'Bagian pengaturan' } });
  const buttons = new Map<string, HTMLButtonElement>();

  for (const item of items) {
    const label = el('span', { text: item.label });
    const button = el(
      'button',
      { attrs: { type: 'button', 'aria-current': 'false' } },
      item.icon ? [icon(item.icon, 17), label] : [label],
    );
    button.addEventListener('click', () => onNavigate(item.id));
    buttons.set(item.id, button);
    nav.append(button);
  }

  const content = el('div', { className: 'page', attrs: { id: 'page' } });
  const root = el('div', { className: 'shell' }, [
    el('aside', { className: 'sidebar' }, [
      el('div', { className: 'brand' }, [
        el('span', { className: 'brand-mark' }, [brandLogo(22)]),
        el('span', { className: 'brand-text' }, [
          el('strong', { text: 'Shielded' }),
          el('span', { className: 'brand-tag', text: 'Privasi lokal' }),
        ]),
      ]),
      nav,
      el(
        'a',
        {
          className: 'sidebar-support',
          attrs: { href: SUPPORT_URL, target: '_blank', rel: 'noopener noreferrer' },
        },
        [icon('coffee', 15), el('span', { text: SUPPORT_LABEL })],
      ),
      el('div', { className: 'sidebar-foot small' }, [
        icon('privacy', 14),
        el('span', { text: 'Diproses lokal' }),
      ]),
    ]),
    el('main', { className: 'main' }, [content]),
  ]);

  const setActive = (id: string): void => {
    for (const [key, button] of buttons) {
      if (key === id) button.setAttribute('aria-current', 'page');
      else button.setAttribute('aria-current', 'false');
    }
  };

  return { root, content, setActive };
}
