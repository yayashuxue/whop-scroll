import { SEED_FEED, type FeedItem, type CtaSpec, type CtaKind } from "@/lib/seed-creators";
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

export function getFeed(): FeedItem[] {
  return [...userPromoted, ...SEED_FEED];
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
  const item = getFeed().find((i) => i.id === input.itemId);
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
