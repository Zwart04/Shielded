export class RouteWatcher {
  private timer: number | null = null;
  private lastHref = '';

  constructor(
    private readonly onChange: (href: string) => void,
    private readonly intervalMs = 400,
  ) {}

  start(): void {
    this.lastHref = location.href;
    this.stop();
    this.timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (location.href === this.lastHref) return;
      this.lastHref = location.href;
      this.onChange(this.lastHref);
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }
}
