export interface FocusHandlers {
  onHidden: () => void;
  onVisible: () => void;
  onWindowBlur: () => void;
  onWindowFocus: () => void;
}

export class FocusWatcher {
  private readonly controller = new AbortController();

  constructor(private readonly handlers: FocusHandlers) {}

  start(): void {
    const { signal } = this.controller;

    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'hidden') this.handlers.onHidden();
        else this.handlers.onVisible();
      },
      { signal },
    );

    window.addEventListener('blur', () => this.handlers.onWindowBlur(), { signal });
    window.addEventListener('focus', () => this.handlers.onWindowFocus(), { signal });
  }

  stop(): void {
    this.controller.abort();
  }
}
