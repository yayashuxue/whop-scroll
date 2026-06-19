"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FeedCard } from "./feed-card";
import { TopBar } from "./top-bar";
import type { FeedItem } from "@/lib/seed-creators";
import type { WalletState } from "@/lib/feed";

export function Feed() {
  const [feed, setFeed] = useState<FeedItem[] | null>(null);
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [muted, setMuted] = useState(true);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        // Merge in client-persisted promotions (studio writes to localStorage
        // so julie's uploads survive server redeploys / cold starts). Dedup by
        // id so a refresh after a cold start doesn't double up.
        let promoted: FeedItem[] = [];
        try {
          promoted = JSON.parse(
            localStorage.getItem("whop_scroll_promoted_v1") ?? "[]",
          ) as FeedItem[];
        } catch {
          // ignore
        }
        const seen = new Set<string>();
        const merged = [...promoted, ...(data.feed as FeedItem[])].filter((c) => {
          if (seen.has(c.id)) return false;
          seen.add(c.id);
          return true;
        });
        setFeed(merged);
        setWallet(data.wallet);
      })
      .catch(() => toast.error("Could not load feed"));
  }, []);

  const trigger = useCallback(
    async (item: FeedItem, ctaIndex: number) => {
      const cta = item.ctas[ctaIndex];
      if (!cta) return;
      const t = toast.loading(`${cta.label}…`);
      try {
        const res = await fetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: item.id, cta }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Action failed");
        setWallet(data.wallet);
        const txn = data.wallet.transactions?.[0];
        toast.success(txn?.note ?? "Done", { id: t });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Action failed", { id: t });
      }
    },
    [],
  );

  const move = useCallback((delta: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ top: delta * el.clientHeight, behavior: "smooth" });
  }, []);

  // Auto-unmute after the first user interaction. Browsers block autoplay with
  // sound, so videos start muted; the first scroll/tap unlocks audio session-wide
  // (TikTok-style — users shouldn't have to hunt for a tiny speaker icon).
  useEffect(() => {
    if (!muted) return;
    const unlock = (e: Event) => {
      // Don't auto-unmute when the user is tapping the mute toggle itself — the
      // button has its own onClick and we'd otherwise race it (unlock sets false,
      // then onClick toggles back to true → looks like nothing happened).
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-mute-toggle]")) return;
      setMuted(false);
    };
    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    window.addEventListener("wheel", unlock, opts);
    window.addEventListener("touchstart", unlock, opts);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("wheel", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [muted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "j") {
        e.preventDefault();
        move(1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "k") {
        e.preventDefault();
        move(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  if (!feed) {
    return (
      <div
        style={{ height: "100dvh" }}
        className="flex items-center justify-center bg-black text-zinc-400"
      >
        loading whop scroll…
      </div>
    );
  }

  return (
    <div
      style={{ height: "100dvh", width: "100%" }}
      className="relative overflow-hidden bg-black"
    >
      <TopBar wallet={wallet} />

      <div
        ref={scrollerRef}
        style={{
          height: "100dvh",
          scrollSnapType: "y mandatory",
          overflowY: "scroll",
          scrollbarWidth: "none",
        }}
        className="mx-auto max-w-md [&::-webkit-scrollbar]:hidden"
      >
        {feed.map((item) => (
          <section
            key={item.id}
            style={{
              height: "100dvh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
            className="relative"
          >
            <FeedCard
              item={item}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              onAction={(idx) => trigger(item, idx)}
            />
          </section>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] text-white/40">
        swipe · scroll · ↑↓
      </div>
    </div>
  );
}
