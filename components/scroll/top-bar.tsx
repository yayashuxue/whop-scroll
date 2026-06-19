"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WalletState, WalletTxn } from "@/lib/feed";

function relativeTime(t: number, now: number) {
  const s = Math.max(1, Math.floor((now - t) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function shortAction(txn: WalletTxn) {
  return txn.note.length > 36 ? `${txn.note.slice(0, 33)}…` : txn.note;
}

export function TopBar({ wallet }: { wallet: WalletState | null }) {
  const mode = wallet?.mode ?? "demo";
  const balance = wallet?.balanceUsd ?? 0;
  const last = wallet?.transactions[0];
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 backdrop-blur">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            mode === "live" ? "bg-[#c1fa81]" : "bg-[#fa4616]"
          }`}
          title={mode === "live" ? "Live Whop API" : "Demo mode"}
        />
        <span className="font-mono text-[12px] font-semibold text-white">
          ${balance.toFixed(0)}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-white/50">
          {mode}
        </span>
      </div>

      {last ? (
        <div className="pointer-events-none mx-1 flex-1 truncate text-center text-[11px] text-white/70">
          {shortAction(last)} · {relativeTime(last.at, now)}
        </div>
      ) : (
        <div className="pointer-events-none mx-1 flex-1 text-center text-[11px] font-semibold tracking-wider text-white/60">
          whop scroll
        </div>
      )}

      <Link
        href="/studio"
        className="pointer-events-auto rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur hover:bg-white/15"
      >
        Studio
      </Link>
    </div>
  );
}
