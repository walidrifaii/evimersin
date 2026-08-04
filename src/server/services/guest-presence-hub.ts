export type GuestLiveCounts = {
  activeGuestCount: number;
  reachableGuestCount: number;
};

type Listener = (counts: GuestLiveCounts) => void;

class GuestPresenceHub {
  private listeners = new Set<Listener>();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private getCounts: (() => Promise<GuestLiveCounts>) | null = null;

  configure(getCounts: () => Promise<GuestLiveCounts>) {
    this.getCounts = getCounts;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async notifyChange(options?: { immediate?: boolean }) {
    if (!this.getCounts || this.listeners.size === 0) return;

    if (options?.immediate) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      await this.broadcast();
      return;
    }

    if (this.debounceTimer) return;

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.broadcast();
    }, 1500);
  }

  private async broadcast() {
    if (!this.getCounts || this.listeners.size === 0) return;

    try {
      const counts = await this.getCounts();
      for (const listener of this.listeners) {
        listener(counts);
      }
    } catch (error) {
      console.error("[guest-presence-hub] Failed to broadcast counts:", error);
    }
  }
}

export const guestPresenceHub = new GuestPresenceHub();
