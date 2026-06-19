"use client";

import { useEffect, useState } from "react";
import type { FeedItem } from "@/lib/seed-creators";

// Interactive "creative app as ad" — these replace the stock poster for
// Whop-native cards (yield, swap, deposit). They render a simulated Whop
// product UI so the scroll feed shows the actual product surface, not b-roll.
//
// The whole component is the "background" of the card. The bottom CTA stack
// and copy still sit on top via the regular FeedCard layout.

export function WhopNativePoster({ item }: { item: FeedItem }) {
  if (item.id === "whop-yield") return <YieldPoster />;
  if (item.id === "whop-swap-cbbtc") return <SwapPoster />;
  return <DepositPoster />;
}

// Background gradient shared across all three so they feel like one product.
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fa461633_0%,transparent_55%),radial-gradient(circle_at_70%_80%,#c1fa8126_0%,transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:32px_32px]" />
      {children}
    </div>
  );
}

function WhopChrome({ label }: { label: string }) {
  return (
    <div className="absolute left-0 right-0 top-12 flex items-center justify-between px-5 text-white">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fa4616] text-sm font-black">
          W
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Whop
          </div>
          <div className="text-sm font-semibold">{label}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c1fa81]" />
        <span className="text-[10px] uppercase tracking-wider text-white/70">
          Live
        </span>
      </div>
    </div>
  );
}

function YieldPoster() {
  // Simulate real-time accrual: balance ticks up every 200ms.
  const [balance, setBalance] = useState(1207.42);
  useEffect(() => {
    const t = setInterval(() => {
      setBalance((b) => b + 0.0114);
    }, 200);
    return () => clearInterval(t);
  }, []);

  return (
    <Frame>
      <WhopChrome label="Earn" />

      <div className="absolute left-1/2 top-[28%] -translate-x-1/2 text-center text-white">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">
          USDC balance
        </div>
        <div className="mt-1 font-mono text-5xl font-bold tabular-nums">
          ${balance.toFixed(4)}
        </div>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#c1fa81]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c1fa81]" />
          +$0.057/min accruing
        </div>
      </div>

      <div className="absolute left-1/2 top-[50%] w-[78%] -translate-x-1/2">
        <div className="rounded-2xl border border-[#c1fa81]/30 bg-[#c1fa81]/[0.05] p-4 backdrop-blur">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/50">
              current APY
            </span>
            <span className="text-[10px] text-white/45">variable</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono text-3xl font-bold text-[#c1fa81]">
            6.08<span className="text-lg">%</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <Stat label="Lockup" value="None" />
          <Stat label="Withdraw" value="Instant" />
          <Stat label="Custody" value="Self" />
          <Stat label="Network" value="Base" />
        </div>
      </div>
    </Frame>
  );
}

function SwapPoster() {
  // Quote that refreshes every ~3s, with a subtle countdown bar.
  const [price, setPrice] = useState(106240);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPrice((p) => p + (Math.random() - 0.5) * 80);
      setRefreshKey((k) => k + 1);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const out = (250 / price).toFixed(6);

  return (
    <Frame>
      <WhopChrome label="Trade" />

      <div className="absolute left-1/2 top-[22%] w-[80%] -translate-x-1/2 space-y-2">
        <SwapRow label="You pay" amount="250.00" token="USDC" tint="white" />
        <div className="flex items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white">
            ↓
          </div>
        </div>
        <SwapRow
          label="You receive"
          amount={out}
          token="cbBTC"
          tint="orange"
        />
      </div>

      <div className="absolute left-1/2 top-[60%] w-[80%] -translate-x-1/2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white backdrop-blur">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-white/55">1 cbBTC</span>
          <span className="font-mono font-semibold">
            ${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/10">
          <div
            key={refreshKey}
            className="h-full bg-[#fa4616]"
            style={{ animation: "swap-tick 3s linear forwards" }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-white/45">
          <span>Quote refresh</span>
          <span>Slippage 0.75%</span>
        </div>
      </div>

      <style>{`
        @keyframes swap-tick {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </Frame>
  );
}

function DepositPoster() {
  return (
    <Frame>
      <WhopChrome label="Deposit" />
      <div className="absolute inset-x-0 top-[26%] flex flex-col items-center text-white">
        <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-white/10 bg-white p-3">
          <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-px">
            {Array.from({ length: 64 }).map((_, i) => {
              const filled = ((i * 37 + 19) % 13) % 3 !== 0;
              return (
                <div
                  key={i}
                  className={filled ? "bg-black" : "bg-transparent"}
                />
              );
            })}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#fa4616] text-white">
              W
            </div>
          </div>
        </div>
        <div className="mt-3 text-[10px] uppercase tracking-wider text-white/50">
          send USDC on Base to
        </div>
        <div className="mt-1 font-mono text-[13px] font-semibold text-white">
          0x7a3f…b918
        </div>
      </div>
    </Frame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[9px] uppercase tracking-wider text-white/45">
        {label}
      </div>
      <div className="text-white">{value}</div>
    </div>
  );
}

function SwapRow({
  label,
  amount,
  token,
  tint,
}: {
  label: string;
  amount: string;
  token: string;
  tint: "white" | "orange";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/45">
        <span>{label}</span>
        <span>Base</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between text-white">
        <span className="font-mono text-2xl font-bold tabular-nums">
          {amount}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            tint === "orange"
              ? "bg-[#fa4616] text-white"
              : "bg-white/15 text-white"
          }`}
        >
          {token}
        </span>
      </div>
    </div>
  );
}
