"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FeedCard } from "./feed-card";
import { WalletTicker } from "./wallet-ticker";
import type { FeedItem } from "@/lib/seed-creators";
import type { WalletState } from "@/lib/feed";

export function Feed() {
  const [feed, setFeed] = useState<FeedItem[] | null>(null);
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [active, setActive] = useState(0);
  const wheelLock = useRef(false);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        setFeed(data.feed);
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

  const move = useCallback(
    (delta: number) => {
      setActive((i) => {
        if (!feed) return i;
        const next = i + delta;
        if (next < 0 || next >= feed.length) return i;
        return next;
      });
    },
    [feed],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "j") move(1);
      if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "k") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (wheelLock.current) return;
      if (Math.abs(e.deltaY) < 24) return;
      wheelLock.current = true;
      move(e.deltaY > 0 ? 1 : -1);
      setTimeout(() => {
        wheelLock.current = false;
      }, 350);
    },
    [move],
  );

  const touchY = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dy) > 50) move(dy < 0 ? 1 : -1);
    touchY.current = null;
  };

  if (!feed) {
    return (
      <div className="flex h-dvh items-center justify-center bg-black text-white/70">
        loading whop scroll…
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto h-dvh max-w-md overflow-hidden bg-black"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <WalletTicker wallet={wallet} />

      <div
        className="flex h-full flex-col transition-transform duration-500 ease-out"
        style={{ transform: `translateY(-${active * 100}%)` }}
      >
        {feed.map((item) => (
          <div key={item.id} className="h-full w-full shrink-0">
            <FeedCard
              item={item}
              onAction={(idx) => trigger(item, idx)}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-2 z-10 flex flex-col items-center justify-center gap-1">
        {feed.map((_, i) => (
          <span
            key={i}
            className={`h-6 w-1 rounded-full transition ${
              i === active ? "bg-white" : "bg-white/25"
            }`}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] text-white/40">
        swipe · scroll · ↑↓
      </div>
    </div>
  );
}
