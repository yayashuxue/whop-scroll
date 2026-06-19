"use client";

import Image from "next/image";
import { CtaStack } from "./cta-stack";
import { InCardOverlay } from "./live-overlay";
import type { FeedItem } from "@/lib/seed-creators";

const KIND_LABEL: Record<FeedItem["kind"], string> = {
  community: "Community",
  product: "Product",
  whop_native: "Whop Native",
  creator_ad: "Creator Ad",
};

export function FeedCard({
  item,
  onAction,
}: {
  item: FeedItem;
  onAction: (ctaIndex: number) => void;
}) {
  // Keep at most one badge so the card doesn't stack duplicate signals.
  const primaryBadge = item.badges[0];

  return (
    <div
      style={{ height: "100%", width: "100%" }}
      className="relative overflow-hidden bg-black"
    >
      {item.videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-95"
          src={item.videoUrl}
          poster={item.posterUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      ) : (
        <div className="ken-burns absolute inset-0">
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover opacity-90"
            priority
            unoptimized
          />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-black/90" />

      <div className="fade-rise absolute inset-x-0 bottom-0 flex items-end gap-3 p-5 pb-10">
        <div className="flex-1 space-y-3 text-white">
          <InCardOverlay kind={item.kind} />

          <div className="flex items-center gap-2">
            <Image
              src={item.avatar}
              alt={item.creator}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-white/30 bg-white/10"
              unoptimized
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold leading-tight">
                  {item.creator}
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black"
                  style={{ background: item.tagColor }}
                >
                  {KIND_LABEL[item.kind]}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/65">
                <span className="truncate">{item.handle}</span>
                {primaryBadge && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className="truncate">{primaryBadge}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold leading-tight">{item.title}</h2>
          <p className="line-clamp-3 text-sm text-white/85">{item.pitch}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/75">
            {item.members != null && (
              <span>👥 {item.members.toLocaleString()}</span>
            )}
            {item.priceUsd != null && <span>💵 ${item.priceUsd}/mo</span>}
            {item.rating != null && <span>⭐ {item.rating}</span>}
          </div>
        </div>

        <CtaStack item={item} onAction={onAction} />
      </div>
    </div>
  );
}
