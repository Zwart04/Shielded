import { el } from './dom.ts';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export function createSegmented<T extends string>(
  options: readonly SegmentOption<T>[],
  value: T,
  onChange: (value: T) => void,
): HTMLDivElement {
  const group = el('div', { className: 'segmented', attrs: { role: 'group' } });

  for (const option of options) {
    const active = option.value === value;
    const button = el('button', {
      text: option.label,
      attrs: {
        type: 'button',
        'aria-pressed': active ? 'true' : 'false',
        disabled: option.disabled ?? false,
      },
    });
    button.addEventListener('click', () => {
      if (button.disabled || option.value === value) return;
      onChange(option.value);
    });
    group.append(button);
  }

  return group;
}
