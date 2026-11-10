export class DomWatcher {
  private observer: MutationObserver | null = null;
  private scheduled = false;
  private frame = 0;

  constructor(private readonly onChange: () => void) {}

  start(root: Node = document.documentElement): void {
    this.stop();
    if (typeof MutationObserver === 'undefined') return;

    this.observer = new MutationObserver((records) => {
      // Perubahan yang hanya berasal dari overlay kita sendiri tidak perlu
      // memicu deteksi ulang. Ini mencegah loop observer -> render -> observer.
      const relevant = records.some((record) => {
        const nodes = [...record.addedNodes, ...record.removedNodes];
        if (nodes.length === 0) return true;
        return nodes.some(
          (node) => !(node instanceof Element && node.classList.contains('psx-overlay')),
        );
      });
      if (relevant) this.schedule();
    });
    this.observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
  }

  private schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    this.frame = requestAnimationFrame(() => {
      this.scheduled = false;
      this.onChange();
    });
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.scheduled = false;
  }
}
