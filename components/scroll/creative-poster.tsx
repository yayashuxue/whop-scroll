"use client";

import { useEffect, useState } from "react";
import type { FeedItem } from "@/lib/seed-creators";

// Creative-app-as-ad posters for non-Whop-native cards. Each one renders a
// distinct mini product UI so the scroll feed never falls back to stock photos.
// Pattern is the same as WhopNativePoster: the component is the background,
// the FeedCard bottom block sits on top with copy + CTA.

export function CreativePoster({ item }: { item: FeedItem }) {
  // User-promoted items declare their creativeKind explicitly.
  if (item.creativeKind === "app_demo") return <PromotedAppDemo item={item} />;
  if (item.creativeKind === "community_intro")
    return <PromotedCommunityIntro item={item} />;
  if (item.creativeKind === "proof_results")
    return <PromotedProofResults item={item} />;

  // Seed cards keep their hand-tuned renderer.
  if (item.id === "comm-prophub") return <TradingDeskPoster />;
  if (item.id === "comm-ecom-lab") return <CommunityChatPoster />;
  if (item.id === "prod-signals") return <SignalFeedPoster />;
  if (item.id === "ad-fitness-ai") return <CreatorClipPoster variant="ai" />;
  if (item.id === "ad-clip-shop") return <CreatorClipPoster variant="clipshop" />;
  return <CreatorClipPoster variant="ai" />;
}

function PromotedAppDemo({ item }: { item: FeedItem }) {
  const stats = item.campaignStats;
  return (
    <Frame tint="#c1fa81">
      <div className="absolute left-5 right-5 top-[14%] rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur">
        <div className="text-[10px] uppercase tracking-wider text-white/50">
          Inside the product
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-4xl">{stats?.emoji ?? "📱"}</span>
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-white">
              {item.creator}
            </div>
            <div className="truncate text-[11px] text-white/55">
              {stats?.product ?? "Product surface"}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-5 right-5 top-[44%] grid grid-cols-3 gap-2">
        {item.members != null && (
          <Stat label="Members" value={item.members.toLocaleString()} />
        )}
        {item.priceUsd != null && <Stat label="Price" value={`$${item.priceUsd}/mo`} />}
        {item.rating != null && <Stat label="Rating" value={`⭐ ${item.rating}`} />}
      </div>
    </Frame>
  );
}

function PromotedCommunityIntro({ item }: { item: FeedItem }) {
  return (
    <Frame tint="#c1fa81">
      <div className="absolute left-5 right-5 top-[14%] space-y-2">
        <PromotedChatRow who={item.creator.split(" ")[0] ?? "Host"} msg="welcome, drop your goal for the week 👇" tint="#fa4616" />
        <PromotedChatRow who="Alex" msg="day 4, hit my first sale 🔥" tint="#c1fa81" />
        <PromotedChatRow who="Jordan" msg="anyone running the new playbook?" tint="#a78bfa" />
      </div>
      <div className="absolute left-5 right-5 top-[50%] flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/70 backdrop-blur">
        <span>
          {item.members?.toLocaleString() ?? "—"} members
        </span>
        <span className="font-mono text-[#c1fa81]">live now</span>
      </div>
    </Frame>
  );
}

function PromotedChatRow({ who, msg, tint }: { who: string; msg: string; tint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
      <div className="flex items-center gap-2 text-white">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-black"
          style={{ background: tint }}
        >
          {who[0]}
        </span>
        <span className="text-sm font-semibold">{who}</span>
        <span className="text-[10px] text-white/40">just now</span>
      </div>
      <div className="mt-1 text-[13px] text-white/85">{msg}</div>
    </div>
  );
}

function PromotedProofResults({ item }: { item: FeedItem }) {
  const proofs = [
    { who: "Sam K.", line: "store hit $14k in 6 weeks", chip: "+14k" },
    { who: "Ariel R.", line: "passed the eval first try", chip: "PASS" },
    { who: "Devon", line: "3x ROAS, scaled to $200/day", chip: "3×" },
  ];
  return (
    <Frame tint="#c1fa81">
      <div className="absolute left-5 right-5 top-[14%] space-y-2">
        {proofs.map((p) => (
          <div
            key={p.who}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{p.who}</div>
              <div className="truncate text-[11px] text-white/60">{p.line}</div>
            </div>
            <span className="rounded-full bg-[#c1fa81] px-2 py-0.5 font-mono text-[11px] font-bold text-black">
              {p.chip}
            </span>
          </div>
        ))}
      </div>
      {item.members != null && (
        <div className="absolute left-5 right-5 top-[52%] rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-center text-[11px] text-white/60 backdrop-blur">
          {item.members.toLocaleString()} members reporting results
        </div>
      )}
    </Frame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2">
      <div className="text-[9px] uppercase tracking-wider text-white/45">{label}</div>
      <div className="truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function Frame({
  children,
  tint,
}: {
  children: React.ReactNode;
  tint: string;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#080808]">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 25% 18%, ${tint}33 0%, transparent 55%), radial-gradient(circle at 75% 82%, ${tint}1a 0%, transparent 50%)`,
        }}
      />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:32px_32px]" />
      {children}
    </div>
  );
}

function TradingDeskPoster() {
  const [pnl, setPnl] = useState(2480.55);
  useEffect(() => {
    const t = setInterval(() => {
      setPnl((p) => p + (Math.random() - 0.4) * 14);
    }, 700);
    return () => clearInterval(t);
  }, []);

  const entries = [
    { side: "L", sym: "NQ", entry: "21240", pnl: "+$420", up: true },
    { side: "S", sym: "ES", entry: "5784", pnl: "+$210", up: true },
    { side: "L", sym: "MNQ", entry: "21208", pnl: "-$45", up: false },
  ];

  return (
    <Frame tint="#c1fa81">
      <div className="absolute left-5 right-5 top-[14%] rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-wider text-white/50">
            Today P&amp;L
          </span>
          <span className="text-[10px] text-white/45">8,214 traders</span>
        </div>
        <div className="mt-1 font-mono text-3xl font-bold tabular-nums text-[#c1fa81]">
          +${pnl.toFixed(2)}
        </div>
        <Sparkline />
      </div>

      <div className="absolute left-5 right-5 top-[44%] space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-white/45">
          Open positions
        </div>
        {entries.map((e) => (
          <div
            key={e.sym}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-white"
          >
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  e.side === "L"
                    ? "bg-[#c1fa81] text-black"
                    : "bg-[#fa4616] text-white"
                }`}
              >
                {e.side === "L" ? "LONG" : "SHORT"}
              </span>
              <span className="font-mono text-sm font-semibold">{e.sym}</span>
              <span className="text-[11px] text-white/45">@ {e.entry}</span>
            </div>
            <span
              className={`font-mono text-sm font-semibold ${
                e.up ? "text-[#c1fa81]" : "text-[#fa4616]"
              }`}
            >
              {e.pnl}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Sparkline() {
  // Static sparkline path that hints at upward drift without animation noise.
  return (
    <svg viewBox="0 0 240 40" className="mt-2 h-8 w-full">
      <defs>
        <linearGradient id="spk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c1fa81" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c1fa81" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 30 L20 28 L40 24 L60 26 L80 20 L100 22 L120 16 L140 18 L160 12 L180 14 L200 8 L220 10 L240 4 L240 40 L0 40 Z"
        fill="url(#spk)"
      />
      <path
        d="M0 30 L20 28 L40 24 L60 26 L80 20 L100 22 L120 16 L140 18 L160 12 L180 14 L200 8 L220 10 L240 4"
        fill="none"
        stroke="#c1fa81"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CommunityChatPoster() {
  const [messages, setMessages] = useState<
    { who: string; msg: string; tint: string }[]
  >([
    { who: "Tasha", msg: "first sale on the new supplier 🔥", tint: "#fa4616" },
    { who: "Devon", msg: "playbook 12 just dropped", tint: "#c1fa81" },
    { who: "Mei", msg: "anyone running TikTok shop?", tint: "#a78bfa" },
  ]);

  useEffect(() => {
    const pool = [
      { who: "Sam", msg: "scaled to 8 ROAS today 📈", tint: "#c1fa81" },
      { who: "Devon", msg: "Q4 supplier list inside →", tint: "#fa4616" },
      { who: "Aria", msg: "weekly call in 10", tint: "#a78bfa" },
      { who: "Kev", msg: "store hit $10k, thanks team", tint: "#c1fa81" },
    ];
    const t = setInterval(() => {
      setMessages((prev) => {
        const next = pool[Math.floor(Math.random() * pool.length)];
        return [...prev.slice(-2), next];
      });
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <Frame tint="#c1fa81">
      <div className="absolute left-5 right-5 top-[14%] space-y-2">
        {messages.map((m, i) => (
          <div
            key={`${m.who}-${i}`}
            className="fade-rise rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur"
          >
            <div className="flex items-center gap-2 text-white">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-black"
                style={{ background: m.tint }}
              >
                {m.who[0]}
              </span>
              <span className="text-sm font-semibold">{m.who}</span>
              <span className="text-[10px] text-white/40">just now</span>
            </div>
            <div className="mt-1 text-[13px] text-white/85">{m.msg}</div>
          </div>
        ))}
      </div>

      <div className="absolute left-5 right-5 top-[48%] flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/70 backdrop-blur">
        <span>3,942 members online</span>
        <span className="font-mono text-[#c1fa81]">+18 this hr</span>
      </div>
    </Frame>
  );
}

function SignalFeedPoster() {
  const [alerts, setAlerts] = useState<
    { tk: string; pct: string; t: string }[]
  >([
    { tk: "BONK", pct: "+24.1%", t: "0:02 ago" },
    { tk: "WIF", pct: "+11.4%", t: "0:08 ago" },
    { tk: "POPCAT", pct: "+6.7%", t: "0:14 ago" },
  ]);

  useEffect(() => {
    const pool = [
      { tk: "PEPE", pct: "+9.2%" },
      { tk: "FLOKI", pct: "+5.6%" },
      { tk: "ALON", pct: "+33.8%" },
      { tk: "MOG", pct: "+12.0%" },
    ];
    const t = setInterval(() => {
      setAlerts((prev) => {
        const n = pool[Math.floor(Math.random() * pool.length)];
        return [
          { ...n, t: "0:01 ago" },
          ...prev.slice(0, 2),
        ];
      });
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <Frame tint="#c1fa81">
      <div className="absolute left-5 right-5 top-[14%] space-y-2">
        {alerts.map((a, i) => (
          <div
            key={`${a.tk}-${i}`}
            className="fade-rise flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white backdrop-blur"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c1fa81]/15 text-[#c1fa81]">
                ↑
              </span>
              <div>
                <div className="font-mono text-base font-bold">{a.tk}</div>
                <div className="text-[10px] text-white/45">{a.t}</div>
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-[#c1fa81]">
              {a.pct}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute left-5 right-5 top-[48%] rounded-2xl border border-white/10 bg-black/40 p-3 text-white backdrop-blur">
        <div className="text-[10px] uppercase tracking-wider text-white/45">
          30-day median
        </div>
        <div className="mt-1 font-mono text-2xl font-bold">2.3× return</div>
      </div>
    </Frame>
  );
}

function CreatorClipPoster({
  variant,
}: {
  variant: "ai" | "clipshop";
}) {
  const isAi = variant === "ai";
  const accent = "#a78bfa";

  // Animated waveform via 20 bars with random heights cycling.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 220);
    return () => clearInterval(t);
  }, []);

  return (
    <Frame tint={accent}>
      <div className="absolute left-1/2 top-[14%] flex h-[44%] w-[78%] -translate-x-1/2 flex-col overflow-hidden rounded-3xl border border-white/15 bg-black">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[10px] text-white/60">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#fa4616]" />
            <span className="uppercase tracking-wider">REC · 00:32</span>
          </span>
          <span>9:16 · 4K</span>
        </div>
        <div
          className="flex-1"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${accent}55 0%, transparent 65%), linear-gradient(180deg, #1a1a1a 0%, #050505 100%)`,
          }}
        >
          <div className="flex h-full flex-col items-center justify-center text-center text-white">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              {isAi ? "Today's drop" : "Reels generated"}
            </div>
            <div className="mt-1 text-3xl font-bold leading-tight">
              {isAi ? "AI cuts 40hr/wk" : "1 podcast → 30 reels"}
            </div>
            <div className="mt-1 text-[11px] text-white/55">
              {isAi ? "watch the toolkit demo" : "auto captions + smart cuts"}
            </div>
          </div>
        </div>
        <div className="flex items-end gap-0.5 border-t border-white/10 px-3 py-2">
          {Array.from({ length: 28 }).map((_, i) => {
            const h = 4 + ((i * 17 + tick * 11) % 18);
            return (
              <span
                key={i}
                className="w-1 rounded-sm"
                style={{ height: `${h}px`, background: accent }}
              />
            );
          })}
        </div>
      </div>
    </Frame>
  );
}
