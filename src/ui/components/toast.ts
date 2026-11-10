let toastElement: HTMLDivElement | null = null;
let hideTimer = 0;

export function showToast(message: string): void {
  if (!toastElement) {
    toastElement = document.createElement('div');
    toastElement.className = 'toast';
    toastElement.setAttribute('role', 'status');
    toastElement.setAttribute('aria-live', 'polite');
    document.body.append(toastElement);
  }

  toastElement.textContent = message;
  toastElement.dataset.visible = 'true';
  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    if (toastElement) toastElement.dataset.visible = 'false';
  }, 3000);
}
