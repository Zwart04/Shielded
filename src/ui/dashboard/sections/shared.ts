import type { Settings } from '../../../shared/types.ts';

export interface SectionContext {
  settings: Settings;
  save: (next: Settings) => void;
  refresh: () => void;
}

export function card(
  title: string,
  description: string,
  children: Array<Node | string>,
): HTMLElement {
  const section = document.createElement('section');
  section.className = 'card';

  const heading = document.createElement('h2');
  heading.className = 'card-title';
  heading.textContent = title;

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = description;

  section.append(heading, desc, ...children);
  return section;
}

export function pageHead(title: string, description: string): HTMLElement {
  const header = document.createElement('header');
  header.className = 'page-head';

  const heading = document.createElement('h1');
  heading.textContent = title;

  const desc = document.createElement('p');
  desc.textContent = description;

  header.append(heading, desc);
  return header;
}

export function settingRow(
  label: string,
  description: string | null,
  control: Node,
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'row';

  const labelWrap = document.createElement('div');
  labelWrap.className = 'row-label';

  const strong = document.createElement('strong');
  strong.textContent = label;
  labelWrap.append(strong);

  if (description) {
    const span = document.createElement('span');
    span.textContent = description;
    labelWrap.append(span);
  }

  row.append(labelWrap, control);
  return row;
}
