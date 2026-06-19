"use client";

import type { FeedItem } from "@/lib/seed-creators";

// Per-card animated overlays that make the poster feel alive without needing
// a real video. Each kind gets a different "vibe" — trading ticker, yield
// counter, etc.

export function LiveOverlay({ kind }: { kind: FeedItem["kind"] }) {
  if (kind === "community") {
    return <TradingTicker />;
  }
  if (kind === "whop_native") {
    return <YieldPulse />;
  }
  if (kind === "product") {
    return <SignalDots />;
  }
  if (kind === "creator_ad") {
    return <RecordingDot />;
  }
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
    <div className="pointer-events-none absolute inset-x-0 top-16 z-[1] overflow-hidden border-y border-white/10 bg-black/30 py-2 backdrop-blur">
      <div
        className="flex w-max gap-6 whitespace-nowrap font-mono text-[11px]"
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
    <div className="pointer-events-none absolute right-4 top-16 z-[1] rounded-2xl border border-[#c1fa81]/40 bg-black/40 px-3 py-2 backdrop-blur">
      <div className="text-[10px] uppercase tracking-wider text-white/60">
        APY
      </div>
      <div className="flex items-baseline gap-1 font-mono text-2xl font-bold text-[#c1fa81]">
        <span>6.08</span>
        <span className="text-sm">%</span>
        <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-[#c1fa81]" />
      </div>
      <div className="text-[10px] text-white/60">USDC · non-custodial</div>
    </div>
  );
}

function SignalDots() {
  return (
    <div className="pointer-events-none absolute right-4 top-16 z-[1] flex flex-col gap-1.5 rounded-2xl border border-white/20 bg-black/40 px-3 py-2 backdrop-blur">
      <div className="text-[10px] uppercase tracking-wider text-white/60">
        signals · live
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#c1fa81]" />
        <span className="font-mono text-[11px] text-white/85">BONK +24%</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 animate-pulse rounded-full bg-[#c1fa81]"
          style={{ animationDelay: "0.4s" }}
        />
        <span className="font-mono text-[11px] text-white/85">WIF +11%</span>
      </div>
    </div>
  );
}

function RecordingDot() {
  return (
    <div className="pointer-events-none absolute right-4 top-16 z-[1] flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#fa4616]" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
        creator · live
      </span>
    </div>
  );
}
