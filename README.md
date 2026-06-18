# Whop Scroll

Internet money should flow as smoothly as you scroll.

Whop Scroll is a TikTok-style vertical feed for the Whop ecosystem — communities, products, and Whop-native primitives (yield, swap, deposit) are all just cards in the feed. Every swipe ends on a one-tap wallet action.

## What's in the feed
- **Community** — creator communities (subscribe / tip)
- **Product** — info products & tools (subscribe / tip / mirror portfolio)
- **Whop Native** — first-party Wallet primitives (USDC ~6% yield, USDC→cbBTC swap, fund wallet)
- **Creator Ad** — creator-uploaded 30-60s pitches with wallet CTAs baked in

## Wallet API surface
Hits Whop's stable Wallet endpoints — `POST /accounts`, `POST /deposits`, `POST /swaps/quote`, `POST /swaps` — and degrades to a clearly-labeled DEMO mode when keys/endpoints aren't available. Every transaction is labeled `LIVE` or `DEMO` so the trace tells the truth.

## Run locally
```
pnpm install
echo "WHOP_API_KEY=sk_..." > .env.local
pnpm dev
```

## Hackathon
Built for the Whop Wallet hackathon. Submission: GitHub + Vercel + Loom pitch.
