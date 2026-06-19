"use client";

import type { FeedItem } from "@/lib/seed-creators";

// Inline "live" widgets that sit inside the bottom content column.
// Keep these compact — they replace the old floating top-right HUD so the
// first screen doesn't look like a debug overlay on mobile.

export function InCardOverlay({ kind }: { kind: FeedItem["kind"] }) {
  if (kind === "community") return <TradingTicker />;
  if (kind === "whop_native") return <YieldPulse />;
  if (kind === "product") return <SignalDots />;
  if (kind === "creator_ad") return <RecordingDot />;
  return null;
}

function TradingTicker() {
  const symbols = [
    { s: "SPY", p: "+0.42%" },
    { s: "QQQ", p: "+0.81%" },
    { s: "NVDA", p: "+2.10%" },
    { s: "TSLA", p: "-0.34%" },
    { s: "AAPL", p: "+0.55%" },
    { s: "MSFT", p: "+0.18%" },
    { s: "META", p: "+1.42%" },
    { s: "GOOG", p: "+0.92%" },
  ];
  const row = [...symbols, ...symbols];
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40 py-1.5 backdrop-blur">
      <div
        className="flex w-max gap-5 whitespace-nowrap font-mono text-[10px]"
        style={{ animation: "ticker-scroll 22s linear infinite" }}
      >
        {row.map((r, i) => (
          <span key={i} className="text-white/85">
            <span className="text-white">{r.s}</span>{" "}
            <span
              className={r.p.startsWith("-") ? "text-[#fa4616]" : "text-[#c1fa81]"}
            >
              {r.p}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function YieldPulse() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#c1fa81]/40 bg-black/40 px-2.5 py-1 backdrop-blur">
      <span className="text-[9px] uppercase tracking-wider text-white/60">
        APY
      </span>
      <span className="font-mono text-sm font-bold text-[#c1fa81]">6.08%</span>
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#c1fa81]" />
      <span className="text-[9px] text-white/60">USDC</span>
    </div>
  );
}

function SignalDots() {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 backdrop-blur">
      <span className="text-[9px] uppercase tracking-wider text-white/60">
        signals
      </span>
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c1fa81]" />
        <span className="font-mono text-[10px] text-white/85">BONK +24%</span>
      </span>
      <span className="flex items-center gap-1">
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c1fa81]"
          style={{ animationDelay: "0.4s" }}
        />
        <span className="font-mono text-[10px] text-white/85">WIF +11%</span>
      </span>
    </div>
  );
}

function RecordingDot() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 backdrop-blur">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#fa4616]" />
      <span className="text-[9px] font-semibold uppercase tracking-wider text-white">
        creator · live
      </span>
    </div>
  );
}
