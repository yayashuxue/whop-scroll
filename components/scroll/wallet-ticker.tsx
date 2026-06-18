"use client";

import type { WalletState } from "@/lib/feed";

export function WalletTicker({ wallet }: { wallet: WalletState | null }) {
  const mode = wallet?.mode ?? "demo";
  const balance = wallet?.balanceUsd ?? 0;
  const y = wallet?.yieldUsd ?? 0;
  const last = wallet?.transactions[0];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/20 bg-black/55 px-3 py-2 backdrop-blur">
        <span className="text-[10px] uppercase tracking-wider text-white/60">Wallet</span>
        <span className="font-mono text-sm font-semibold text-white">
          ${balance.toFixed(2)}
        </span>
        {y > 0 && (
          <span className="font-mono text-[11px] text-[#c1fa81]">
            +${y.toFixed(0)} yielding
          </span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            mode === "live"
              ? "bg-[#c1fa81] text-black"
              : "bg-[#fa4616] text-white"
          }`}
        >
          {mode}
        </span>
      </div>

      {last && (
        <div className="pointer-events-auto max-w-[55%] truncate rounded-2xl border border-white/20 bg-black/55 px-3 py-2 text-[11px] text-white/85 backdrop-blur">
          {last.note}
        </div>
      )}
    </div>
  );
}
