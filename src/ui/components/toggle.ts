import { el } from './dom.ts';

export interface ToggleOptions {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function createToggle(options: ToggleOptions): HTMLButtonElement {
  const button = el('button', {
    className: 'switch',
    attrs: {
      type: 'button',
      role: 'switch',
      'aria-checked': options.checked ? 'true' : 'false',
      'aria-label': options.label,
      disabled: options.disabled ?? false,
    },
  });

  button.addEventListener('click', () => {
    if (button.disabled) return;
    const next = button.getAttribute('aria-checked') !== 'true';
    button.setAttribute('aria-checked', next ? 'true' : 'false');
    options.onChange(next);
  });

  return button;
}
