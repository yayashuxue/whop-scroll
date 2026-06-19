import { addPromotion } from "@/lib/feed";
import type { FeedItem } from "@/lib/seed-creators";

type PromoteBody = {
  campaignId: string;
  creator: string;
  handle: string;
  title: string;
  pitch: string;
  posterUrl: string;
  videoUrl?: string;
  priceUsd: number;
  ctaKind: "subscribe" | "tip";
  ctaAmount: number;
};

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}`;

export async function POST(request: Request) {
  const body = (await request.json()) as PromoteBody;

  const cta =
    body.ctaKind === "subscribe"
      ? {
          kind: "subscribe" as const,
          label: `Unlock $${body.ctaAmount}/mo`,
          amountUsd: body.ctaAmount,
        }
      : {
          kind: "tip" as const,
          label: `Tip $${body.ctaAmount}`,
          amountUsd: body.ctaAmount,
        };

  const item: FeedItem = {
    id: `promo-${body.campaignId}-${Date.now().toString(36)}`,
    kind: "creator_ad",
    creator: body.creator,
    handle: body.handle,
    avatar: avatar(body.handle || body.campaignId),
    posterUrl: body.posterUrl,
    videoUrl: body.videoUrl,
    title: body.title,
    pitch: body.pitch,
    priceUsd: body.priceUsd,
    badges: ["Creator upload", "New"],
    ctas: [cta, { kind: "tip", label: "Tip $3", amountUsd: 3 }],
    tagColor: "#a78bfa",
  };

  addPromotion(item);
  return Response.json({ ok: true, item });
}
