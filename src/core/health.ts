export interface HealthSummary {
  failures: Record<string, number>;
  totalFailures: number;
}

/**
 * Pencatat kegagalan selector di memori.
 * Tidak dikirim ke mana pun; hanya untuk diagnostik lokal.
 */
export class SelectorHealth {
  private failures = new Map<string, number>();

  reportFailure(candidateId: string): void {
    this.failures.set(candidateId, (this.failures.get(candidateId) ?? 0) + 1);
  }

  reportSuccess(candidateId: string): void {
    if (this.failures.has(candidateId)) this.failures.delete(candidateId);
  }

  summary(): HealthSummary {
    let totalFailures = 0;
    const failures: Record<string, number> = {};
    for (const [id, count] of this.failures) {
      failures[id] = count;
      totalFailures += count;
    }
    return { failures, totalFailures };
  }

  reset(): void {
    this.failures.clear();
  }
}
