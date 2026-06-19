"use client";

import Image from "next/image";
import { CtaStack } from "./cta-stack";
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
  return (
    <div
      style={{ height: "100%", width: "100%" }}
      className="relative overflow-hidden bg-black"
    >
      <Image
        src={item.posterUrl}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, 480px"
        className="object-cover opacity-90"
        priority
        unoptimized
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/85" />

      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-black"
          style={{ background: item.tagColor }}
        >
          {KIND_LABEL[item.kind]}
        </span>
        {item.badges.map((b) => (
          <span
            key={b}
            className="rounded-full border border-white/30 bg-black/40 px-3 py-1 text-[11px] font-medium text-white backdrop-blur"
          >
            {b}
          </span>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5 pb-8">
        <div className="flex-1 space-y-3 text-white">
          <div className="flex items-center gap-3">
            <Image
              src={item.avatar}
              alt={item.creator}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-white/30 bg-white/10"
              unoptimized
            />
            <div>
              <div className="text-sm font-semibold leading-tight">{item.creator}</div>
              <div className="text-xs text-white/70">{item.handle}</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold leading-tight">{item.title}</h2>
          <p className="line-clamp-3 text-sm text-white/85">{item.pitch}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/75">
            {item.members != null && (
              <span>👥 {item.members.toLocaleString()}</span>
            )}
            {item.priceUsd != null && (
              <span>💵 ${item.priceUsd}/mo</span>
            )}
            {item.rating != null && <span>⭐ {item.rating}</span>}
          </div>
        </div>

        <CtaStack item={item} onAction={onAction} />
      </div>
    </div>
  );
}
