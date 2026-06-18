// Curated Whop creators + first-party offerings + product cards.
// v1 demo supply: real Whop creators with public vertical content.
// v2 vision: creators upload native 30-60s pitches with wallet CTA bindings.

export type FeedKind = "community" | "product" | "whop_native" | "creator_ad";

export type CtaKind =
  | "subscribe"
  | "tip"
  | "swap"
  | "yield"
  | "deposit"
  | "mirror";

export type CtaSpec = {
  kind: CtaKind;
  label: string;
  amountUsd?: number;
  // optional config carried through to wallet action
  toToken?: string;
};

export type FeedItem = {
  id: string;
  kind: FeedKind;
  creator: string;
  handle: string;
  avatar: string;
  posterUrl: string;
  videoUrl?: string;
  title: string;
  pitch: string;
  members?: number;
  priceUsd?: number;
  rating?: number;
  badges: string[];
  ctas: CtaSpec[];
  tagColor: string;
};

// Public posters via picsum.photos for stable previews (seed-based so they're
// reproducible across reloads). Real Whop creator names/positioning so the
// demo reads as authentic curation, not fictional.
const poster = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/720/1280`;

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}`;

export const SEED_FEED: FeedItem[] = [
  {
    id: "comm-prophub",
    kind: "community",
    creator: "Prop Trading Hub",
    handle: "@prophub",
    avatar: avatar("prophub"),
    posterUrl: poster("prop-trading"),
    title: "Pass any prop firm in 14 days",
    pitch:
      "Daily trade plans + live mentoring. 8,200 traders inside. We post the entries before the open.",
    members: 8214,
    priceUsd: 49,
    rating: 4.8,
    badges: ["Top 1% Whop", "Verified"],
    ctas: [
      { kind: "subscribe", label: "Join $49/mo", amountUsd: 49 },
      { kind: "tip", label: "Tip $5", amountUsd: 5 },
    ],
    tagColor: "#c1fa81",
  },
  {
    id: "whop-yield",
    kind: "whop_native",
    creator: "Whop Wallet",
    handle: "@whop",
    avatar: avatar("whop-native"),
    posterUrl: poster("usdc-yield"),
    title: "Park USDC at ~6% APY",
    pitch:
      "Idle stable balance? Whop's native yield pays you while you scroll. No lockup, instant withdrawal.",
    badges: ["Whop native", "Non-custodial"],
    ctas: [
      { kind: "yield", label: "Deposit $100 → yield", amountUsd: 100 },
      { kind: "deposit", label: "Fund wallet", amountUsd: 500 },
    ],
    tagColor: "#fa4616",
  },
  {
    id: "ad-fitness-ai",
    kind: "creator_ad",
    creator: "Maya · AI fitness",
    handle: "@mayalifts",
    avatar: avatar("maya"),
    posterUrl: poster("ai-fitness"),
    title: "AI cuts 40hr/wk for a creator",
    pitch:
      "Self-made ad. 30s pitch. Subscribe for the full toolkit: prompt library + reel templates + custom GPT.",
    priceUsd: 29,
    rating: 4.9,
    badges: ["Creator upload", "New"],
    ctas: [
      { kind: "subscribe", label: "Unlock $29/mo", amountUsd: 29 },
      { kind: "tip", label: "Tip $3", amountUsd: 3 },
    ],
    tagColor: "#a78bfa",
  },
  {
    id: "prod-signals",
    kind: "product",
    creator: "Solana Signals",
    handle: "@solsignals",
    avatar: avatar("solana"),
    posterUrl: poster("solana-signals"),
    title: "Solana memecoin alerts, 2.3x median",
    pitch:
      "Bot-driven alerts the moment liquidity hits. 12,400 subs. Mirror the portfolio with one tap.",
    members: 12400,
    priceUsd: 79,
    rating: 4.6,
    badges: ["Top earner"],
    ctas: [
      { kind: "subscribe", label: "Subscribe $79/mo", amountUsd: 79 },
      { kind: "mirror", label: "Mirror portfolio", amountUsd: 250, toToken: "SOL" },
    ],
    tagColor: "#c1fa81",
  },
  {
    id: "whop-swap-cbbtc",
    kind: "whop_native",
    creator: "Whop Wallet",
    handle: "@whop",
    avatar: avatar("whop-swap"),
    posterUrl: poster("cbbtc-swap"),
    title: "1-tap swap USDC → cbBTC",
    pitch:
      "Long Bitcoin without leaving Whop. Same Whop API the trading bot demo uses, settles on Base.",
    badges: ["Whop native", "Base"],
    ctas: [
      { kind: "swap", label: "Swap $50 → cbBTC", amountUsd: 50, toToken: "cbBTC" },
      { kind: "swap", label: "Swap $250 → cbBTC", amountUsd: 250, toToken: "cbBTC" },
    ],
    tagColor: "#fa4616",
  },
  {
    id: "comm-ecom-lab",
    kind: "community",
    creator: "Ecom Lab",
    handle: "@ecomlab",
    avatar: avatar("ecomlab"),
    posterUrl: poster("ecom-lab"),
    title: "Build your first $10k store",
    pitch:
      "Weekly playbooks + supplier directory. 3,900 members. The community Whop keeps recommending.",
    members: 3942,
    priceUsd: 39,
    rating: 4.7,
    badges: ["Verified"],
    ctas: [
      { kind: "subscribe", label: "Join $39/mo", amountUsd: 39 },
      { kind: "tip", label: "Tip $5", amountUsd: 5 },
    ],
    tagColor: "#c1fa81",
  },
  {
    id: "ad-clip-shop",
    kind: "creator_ad",
    creator: "ClipShop",
    handle: "@clipshop",
    avatar: avatar("clipshop"),
    posterUrl: poster("clipshop"),
    title: "Turn 1 podcast into 30 reels",
    pitch:
      "Self-made ad. Upload long-form, get 30 vertical clips with captions. Pay-per-clip or subscribe.",
    priceUsd: 19,
    badges: ["Creator upload"],
    ctas: [
      { kind: "subscribe", label: "Subscribe $19/mo", amountUsd: 19 },
      { kind: "tip", label: "Send $1 tip", amountUsd: 1 },
    ],
    tagColor: "#a78bfa",
  },
];
