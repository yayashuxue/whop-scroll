"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WalletState, WalletTxn } from "@/lib/feed";

function relativeTime(t: number, now: number) {
  const s = Math.max(1, Math.floor((now - t) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

const VERB: Record<WalletTxn["ctaKind"], string> = {
  subscribe: "joined",
  tip: "tipped",
  swap: "swapped",
  yield: "earning",
  deposit: "deposited",
  mirror: "mirrored",
};

function actionChip(txn: WalletTxn) {
  const verb = VERB[txn.ctaKind];
  const amount = txn.amountUsd ? ` $${txn.amountUsd}` : "";
  return `${verb}${amount}`;
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
        <div className="pointer-events-auto mx-1 flex flex-1 items-center justify-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 animate-pulse rounded-full ${
              last.mode === "live" ? "bg-[#c1fa81]" : "bg-white/50"
            }`}
          />
          <span className="truncate rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/85">
            {actionChip(last)}
          </span>
          <span className="text-[10px] tabular-nums text-white/45">
            {relativeTime(last.at, now)}
          </span>
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
