import { addPromotion } from "@/lib/feed";
import type { FeedItem } from "@/lib/seed-creators";

type CtaInput = { label: string; url: string };

type PromoteBody = {
  creator: string;
  handle: string;
  title: string;
  pitch: string;
  videoUrl?: string;
  ctas: CtaInput[];
};

function isWhopUrl(raw: string): boolean {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return (
      (u.protocol === "https:" || u.protocol === "http:") &&
      /(^|\.)whop\.com$/.test(u.hostname)
    );
  } catch {
    return false;
  }
}

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}`;

export async function POST(request: Request) {
  const body = (await request.json()) as PromoteBody;

  if (!body.title || !body.pitch || !body.ctas?.length) {
    return Response.json({ error: "title, pitch, and at least one CTA required" }, { status: 400 });
  }
  for (const c of body.ctas) {
    if (!c.label || !c.url || !isWhopUrl(c.url)) {
      return Response.json(
        { error: "every CTA needs a label and a whop.com URL" },
        { status: 400 },
      );
    }
  }

  const primaryUrl = body.ctas[0].url;
  const item: FeedItem = {
    id: `promo-${body.handle.replace(/[^a-z0-9]/gi, "")}-${Date.now().toString(36)}`,
    kind: "creator_ad",
    creator: body.creator,
    handle: body.handle,
    avatar: avatar(body.handle || body.creator),
    posterUrl: "",
    videoUrl: body.videoUrl,
    title: body.title,
    pitch: body.pitch,
    badges: [],
    ctas: body.ctas.map((c) => ({
      kind: "subscribe" as const,
      label: c.label,
      amountUsd: 0,
    })),
    tagColor: "#c1fa81",
    whopUrl: primaryUrl,
    creativeKind: body.videoUrl ? "creator_video" : "community_intro",
  };

  addPromotion(item);
  return Response.json({ ok: true, item });
}
