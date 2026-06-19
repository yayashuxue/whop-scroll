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
  const scrollerRef = useRef<HTMLDivElement | null>(null);

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

  const move = useCallback((delta: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ top: delta * el.clientHeight, behavior: "smooth" });
  }, []);

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
        style={{ height: "100vh" }}
        className="flex items-center justify-center bg-black text-zinc-400"
      >
        loading whop scroll…
      </div>
    );
  }

  return (
    <div
      style={{ height: "100vh", width: "100%" }}
      className="relative overflow-hidden bg-black"
    >
      <WalletTicker wallet={wallet} />

      <div
        ref={scrollerRef}
        style={{
          height: "100vh",
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
              height: "100vh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
            className="relative"
          >
            <FeedCard item={item} onAction={(idx) => trigger(item, idx)} />
          </section>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] text-white/40">
        swipe · scroll · ↑↓
      </div>
    </div>
  );
}
