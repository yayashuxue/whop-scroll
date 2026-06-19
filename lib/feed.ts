import {
  SEED_FEED,
  type FeedItem,
  type CtaSpec,
  type CtaKind,
  type CreativeKind,
} from "@/lib/seed-creators";
import { WhopApiError, whop } from "@/lib/whop";

type WalletMode = "demo" | "live";

export type WalletTxn = {
  id: string;
  at: number;
  itemId: string;
  creator: string;
  ctaKind: CtaKind;
  ctaLabel: string;
  amountUsd: number;
  mode: WalletMode;
  status: "settled" | "pending";
  note: string;
};

export type WalletState = {
  accountId: string | null;
  depositAddress: string | null;
  balanceUsd: number;
  yieldUsd: number;
  mode: WalletMode;
  transactions: WalletTxn[];
};

let wallet: WalletState = {
  accountId: null,
  depositAddress: null,
  balanceUsd: 250,
  yieldUsd: 0,
  mode: "demo",
  transactions: [],
};

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getWallet() {
  return wallet;
}

// User-promoted ads added via /studio. Newest first so the creator sees their
// own promoted card immediately at the top of the feed.
let userPromoted: FeedItem[] = [];

// Cached real-data cards sourced from the Whop API. /companies/{biz_id} reads
// cross-account with our apik_ key, so we hand-curate real biz ids of well-known
// Whop creators and enrich each at runtime. Hardcoded list (route scrape was
// done once offline) keeps cold start fast and avoids per-request whop.com hits.
let liveCards: FeedItem[] = [];
let liveCardsAt = 0;
const LIVE_TTL_MS = 60_000;

// Real Whop creator biz_ids verified via /companies/{id}. Each entry carries
// its preferred creativeKind (so generated UI varies card-to-card) plus a
// vibe-appropriate primary CTA label. CTA label/amount drives copy on the
// chartreuse pill; defaults are fine but per-creator copy makes the feed
// feel like a real marketplace, not a single template.
type LiveCardSpec = {
  bizId: string;
  creativeKind: CreativeKind;
  primary: { label: string; amountUsd?: number; kind?: CtaKind };
  secondary?: { label: string; amountUsd?: number; kind: CtaKind };
  videoUrl?: string;
};
const CURATED_LIVE_BIZ: LiveCardSpec[] = [
  {
    bizId: "biz_cW1Xjmt8f9Wp1x", // Streamer Clips at /stake, 100k+ members
    creativeKind: "creator_video",
    videoUrl: "/videos/streamer-clips.mp4",
    primary: { label: "Join Streamer Clips", amountUsd: 0 },
    secondary: { kind: "subscribe", label: "Get VIP access", amountUsd: 19 },
  },
];

// Top video slot — clip itself was produced by ClipCutter (julie's own app on
// Whop). Same vertical hook the algorithm loves, but the CTA promotes ClipCutter
// so the "this clip exists because of ClipCutter" angle closes the loop.
const ZACH_CAL_AI_VIDEO_CARD: FeedItem = {
  id: "live-video-clipcutter",
  kind: "creator_ad",
  creator: "ClipCutter",
  handle: "@clipcutter",
  avatar:
    "https://assets-2-prod.whop.com/public/uploads/user_29334771/image/ai_prompts/2026-06-18/c4031854-9a79-49bf-9610-91885a5d6fc9.png",
  posterUrl: "",
  videoUrl: "/videos/zach-cal-ai-en.mp4",
  title: "ClipCutter · 1-click. Long → Short. Local AI. $9.99.",
  pitch: "This clip was cut by ClipCutter. Drop in any podcast, ship vertical clips that print. Local AI, $9.99/mo. Live on Whop.",
  badges: [],
  ctas: [{ kind: "subscribe", label: "Try ClipCutter · $9.99", amountUsd: 0 }],
  tagColor: "#c1fa81",
  whopUrl: "https://whop.com/get-clip-cutter/clipcutter-e4/",
  creativeKind: "creator_video",
};

// Real Dub App promo video pulled straight from whop.com/dub. The community
// card version was minimalist and ugly per julie — replace with the actual
// product walkthrough video the founder uploaded.
const DUB_APP_VIDEO_CARD: FeedItem = {
  id: "live-video-dub",
  kind: "creator_ad",
  creator: "Dub App",
  handle: "@dub",
  avatar:
    "https://img-v2-prod.whop.com/C9xzYnI7Olb3WykUNJn-NGFdxEyEzQV9NcL8VO_qtFk/mb:180000/plain/https://assets-2-prod.whop.com/public/uploads/2025-04-21/user_7789629_3b2511dd-c3e0-413f-b4df-80af6ba7602c.png",
  posterUrl: "",
  videoUrl: "/videos/dub-app.mp4",
  title: "Dub the trades of the top traders",
  pitch: "Copy real positions from verified traders. 56k members already running it on Whop.",
  badges: [],
  ctas: [
    { kind: "subscribe", label: "Open Dub App", amountUsd: 0 },
    { kind: "subscribe", label: "Go Pro · $29/mo", amountUsd: 29 },
  ],
  tagColor: "#c1fa81",
  whopUrl: "https://whop.com/dub/",
  creativeKind: "creator_video",
};

type WhopCompany = {
  id: string;
  title: string;
  description: string | null;
  member_count: number | null;
  route: string;
  logo: { url: string } | null;
  owner_user: { id: string; username: string | null; name: string | null } | null;
};

type WhopExperience = {
  id: string;
  name: string;
  app: { name: string; icon: { url: string } | null } | null;
};

type WhopUser = {
  id: string;
  username: string | null;
  profile_picture: { url: string } | null;
};

async function fetchLiveCardForBiz(spec: LiveCardSpec): Promise<FeedItem | null> {
  const { bizId, creativeKind, primary, secondary, videoUrl } = spec;
  try {
    const company = await whop<WhopCompany>(`/companies/${bizId}`);
    const owner = company.owner_user;
    const [user, expRes] = await Promise.all([
      owner
        ? whop<WhopUser>(`/users/${owner.id}`).catch(() => null)
        : Promise.resolve(null),
      whop<{ data: WhopExperience[] }>(
        `/experiences?company_id=${bizId}`,
      ).catch(() => ({ data: [] as WhopExperience[] })),
    ]);
    const firstExp = expRes.data?.[0] ?? null;

    const handle = `@${company.route}`;
    const creator = company.title?.trim() || user?.username || "Whop creator";
    // Community cards represent the brand, not the founder personally — show the
    // company logo first and fall back to the owner's profile picture only when
    // the brand has no logo. Without this flip, every card showed the owner's
    // selfie even when the company had a clean brand mark (e.g. Dub App).
    const avatarUrl =
      company.logo?.url ??
      user?.profile_picture?.url ??
      `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(company.id)}`;
    const title = company.description
      ? creator
      : firstExp?.name
        ? `${creator} · ${firstExp.name}`
        : `${creator} on Whop`;
    const pitch =
      company.description?.trim() ||
      (firstExp?.app?.name
        ? `Real Whop community running ${firstExp.app.name}. Members get gated access via the offering page.`
        : `Real Whop community. ${company.member_count ?? 0} members. Tap to open on Whop.`);

    const ctas: CtaSpec[] = [
      {
        kind: primary.kind ?? "subscribe",
        label: primary.label,
        amountUsd: primary.amountUsd ?? 0,
      },
    ];
    if (secondary) {
      ctas.push({
        kind: secondary.kind,
        label: secondary.label,
        amountUsd: secondary.amountUsd ?? 0,
      });
    }

    return {
      id: `live-${company.id}`,
      kind: "community",
      creator,
      handle,
      avatar: avatarUrl,
      posterUrl: "",
      videoUrl,
      title,
      pitch,
      members: company.member_count ?? undefined,
      badges: [],
      ctas,
      tagColor: "#c1fa81",
      whopUrl: `https://whop.com/${company.route}/`,
      creativeKind,
      campaignStats: {
        product: firstExp?.app?.name ?? "Whop offering",
        emoji: "🟢",
      },
    } satisfies FeedItem;
  } catch {
    return null;
  }
}

async function ensureLiveCards(): Promise<FeedItem[]> {
  if (liveCards.length > 0 && Date.now() - liveCardsAt < LIVE_TTL_MS) {
    return liveCards;
  }
  const results = await Promise.all(
    CURATED_LIVE_BIZ.map((spec) => fetchLiveCardForBiz(spec)),
  );
  liveCards = results.filter((c): c is FeedItem => c !== null);
  liveCardsAt = Date.now();
  return liveCards;
}

export async function getFeed(): Promise<FeedItem[]> {
  const live = await ensureLiveCards();
  // julie dropped the low-quality app-card UI cards from the seed deck — only
  // keep the Whop-native simulated UI (yield/swap) as visual variety alongside
  // the real video content. Generic community/creator_ad seed cards are out.
  const seedKeep = SEED_FEED.filter((c) => c.kind === "whop_native");
  return [
    ...userPromoted,
    ZACH_CAL_AI_VIDEO_CARD,
    DUB_APP_VIDEO_CARD,
    ...live,
    ...seedKeep,
  ];
}

export function addPromotion(item: FeedItem) {
  userPromoted = [item, ...userPromoted].slice(0, 12);
  return item;
}

async function safeWhop<T>(path: string, method: string, body?: unknown) {
  try {
    const result = await whop<T>(path, { method, body });
    wallet.mode = "live";
    return { ok: true as const, result };
  } catch (error) {
    if (error instanceof WhopApiError) {
      // any error from Whop (no key, 4xx, 5xx) → fall back to demo so the
      // feed action still completes visibly. Mode label tells the truth.
      wallet.mode = "demo";
      return { ok: false as const, error };
    }
    throw error;
  }
}

function record(txn: Omit<WalletTxn, "id" | "at">) {
  wallet.transactions = [
    { id: id("tx"), at: Date.now(), ...txn },
    ...wallet.transactions,
  ].slice(0, 30);
}

async function ensureAccount() {
  if (wallet.accountId) return;
  const res = await safeWhop<{ id: string }>("/accounts", "POST", {
    email: process.env.WHOP_ACCOUNT_EMAIL ?? "jyshi1107@gmail.com",
    metadata: { product: "whop-scroll" },
  });
  wallet.accountId = res.ok && res.result ? res.result.id : id("acct");
}

export type FeedAction = {
  itemId: string;
  cta: CtaSpec;
};

export async function executeFeedAction(input: FeedAction): Promise<WalletState> {
  const items = await getFeed();
  const item = items.find((i) => i.id === input.itemId);
  if (!item) return wallet;

  const amountUsd = Number(input.cta.amountUsd ?? 0);

  await ensureAccount();

  let mode: WalletMode = wallet.mode;
  let note = "";

  switch (input.cta.kind) {
    case "subscribe": {
      const res = await safeWhop("/checkout", "POST", {
        account_id: wallet.accountId,
        product_id: item.id,
        amount: amountUsd,
        currency: "USDC",
      });
      mode = res.ok ? "live" : "demo";
      note = res.ok
        ? `Subscribed to ${item.creator} ($${amountUsd})`
        : `Demo subscribe: ${item.creator} $${amountUsd}/mo`;
      wallet.balanceUsd = Math.max(0, wallet.balanceUsd - amountUsd);
      break;
    }
    case "tip": {
      const res = await safeWhop("/transfers", "POST", {
        from: wallet.accountId,
        to_handle: item.handle,
        amount: amountUsd,
        currency: "USDC",
      });
      mode = res.ok ? "live" : "demo";
      note = res.ok
        ? `Tipped ${item.creator} $${amountUsd}`
        : `Demo tip: ${item.creator} $${amountUsd}`;
      wallet.balanceUsd = Math.max(0, wallet.balanceUsd - amountUsd);
      break;
    }
    case "swap": {
      const quote = await safeWhop("/swaps/quote", "POST", {
        amount: String(amountUsd),
        from_token: "USDC",
        to_token: input.cta.toToken ?? "cbBTC",
        slippage_bps: 75,
      });
      const exec = quote.ok
        ? await safeWhop("/swaps", "POST", {
            account_id: wallet.accountId,
            amount: String(amountUsd),
            from_token: "USDC",
            to_token: input.cta.toToken ?? "cbBTC",
            slippage_bps: 75,
          })
        : { ok: false as const };
      mode = exec.ok ? "live" : "demo";
      note = exec.ok
        ? `Swapped $${amountUsd} → ${input.cta.toToken ?? "cbBTC"}`
        : `Demo swap: $${amountUsd} → ${input.cta.toToken ?? "cbBTC"}`;
      wallet.balanceUsd = Math.max(0, wallet.balanceUsd - amountUsd);
      break;
    }
    case "mirror": {
      const res = await safeWhop("/portfolios/mirror", "POST", {
        account_id: wallet.accountId,
        target_handle: item.handle,
        amount: amountUsd,
      });
      mode = res.ok ? "live" : "demo";
      note = res.ok
        ? `Mirroring ${item.creator}'s portfolio ($${amountUsd})`
        : `Demo mirror: ${item.creator} $${amountUsd}`;
      wallet.balanceUsd = Math.max(0, wallet.balanceUsd - amountUsd);
      break;
    }
    case "yield": {
      const res = await safeWhop("/yield/deposit", "POST", {
        account_id: wallet.accountId,
        amount: amountUsd,
      });
      mode = res.ok ? "live" : "demo";
      note = res.ok
        ? `Earning yield on $${amountUsd}`
        : `Demo yield: $${amountUsd} at ~6% APY`;
      wallet.balanceUsd = Math.max(0, wallet.balanceUsd - amountUsd);
      wallet.yieldUsd += amountUsd;
      break;
    }
    case "deposit": {
      const res = await safeWhop<{ deposit_address?: { evm?: string } }>(
        "/deposits",
        "POST",
        { destination: wallet.accountId, amount: amountUsd },
      );
      mode = res.ok ? "live" : "demo";
      const evm = res.ok ? res.result?.deposit_address?.evm ?? null : null;
      wallet.depositAddress = evm ?? "provisioning";
      wallet.balanceUsd += amountUsd;
      note = evm
        ? `Send $${amountUsd} USDC to ${evm.slice(0, 10)}…`
        : `Demo deposit: +$${amountUsd} USDC`;
      break;
    }
  }

  record({
    itemId: item.id,
    creator: item.creator,
    ctaKind: input.cta.kind,
    ctaLabel: input.cta.label,
    amountUsd,
    mode,
    status: mode === "live" ? "pending" : "settled",
    note,
  });

  return wallet;
}
