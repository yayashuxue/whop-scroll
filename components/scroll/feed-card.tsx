"use client";

import Image from "next/image";
import { WhopNativePoster } from "./whop-native-poster";
import type { FeedItem } from "@/lib/seed-creators";

const KIND_LABEL: Record<FeedItem["kind"], string> = {
  community: "Community",
  product: "Product",
  whop_native: "Whop native",
  creator_ad: "Creator ad",
};

function primaryLabel(item: FeedItem): string {
  const c = item.ctas[0];
  if (!c) return "Open on Whop";
  if (item.kind === "whop_native" && c.kind === "yield") return "Earn 6% APY";
  if (item.kind === "whop_native" && c.kind === "swap") return "Trade now";
  if (item.kind === "whop_native" && c.kind === "deposit") return "Fund wallet";
  return c.label;
}

export function FeedCard({
  item,
  onAction,
}: {
  item: FeedItem;
  onAction: (ctaIndex: number) => void;
}) {
  const primaryBadge = item.badges[0];
  const isNative = item.kind === "whop_native";
  const secondary = item.ctas[1];

  return (
    <div
      style={{ height: "100%", width: "100%" }}
      className="relative overflow-hidden bg-black"
    >
      {/* Background layer: video > Whop-native simulated UI > Ken Burns poster */}
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
      ) : isNative ? (
        <WhopNativePoster item={item} />
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

      {/* Bottom-up scrim. For native cards the scrim is heavier so the simulated UI
          stays readable behind the copy. */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isNative
            ? "bg-gradient-to-b from-black/40 via-black/20 to-black"
            : "bg-gradient-to-b from-black/30 via-black/5 to-black/90"
        }`}
      />

      {/* Bottom content block: creator row + title + pitch + dual CTA.
          Top half of the card is reserved for poster / native UI so they never
          collide with this stack. */}
      <div className="fade-rise absolute inset-x-0 bottom-0 space-y-3 p-5 pb-7">
        <div className="flex items-center gap-2 text-white">
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

        <div className="space-y-1.5 text-white">
          <h2 className="line-clamp-2 text-[24px] font-bold leading-[1.1] tracking-tight">
            {item.title}
          </h2>
          <p className="line-clamp-2 text-[13px] text-white/80">{item.pitch}</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/60">
            {item.members != null && (
              <span>👥 {item.members.toLocaleString()}</span>
            )}
            {item.priceUsd != null && <span>💵 ${item.priceUsd}/mo</span>}
            {item.rating != null && <span>⭐ {item.rating}</span>}
          </div>
        </div>

        <CtaBar
          item={item}
          primaryLabel={primaryLabel(item)}
          secondaryLabel={secondary?.label ?? "Tip"}
          onAction={onAction}
        />
      </div>
    </div>
  );
}

function CtaBar({
  item,
  primaryLabel,
  secondaryLabel,
  onAction,
}: {
  item: FeedItem;
  primaryLabel: string;
  secondaryLabel: string;
  onAction: (ctaIndex: number) => void;
}) {
  function handlePrimary(e: React.MouseEvent) {
    e.stopPropagation();
    if (item.whopUrl) {
      window.open(item.whopUrl, "_blank", "noopener,noreferrer");
    }
    onAction(0);
  }

  return (
    <div className="flex items-stretch gap-2 pt-1">
      <button
        type="button"
        onClick={handlePrimary}
        className="flex-1 rounded-full bg-[#c1fa81] px-5 py-3.5 text-center text-[15px] font-bold text-black transition active:scale-[0.98] hover:bg-[#d2fc94]"
      >
        {primaryLabel}
      </button>

      {item.ctas[1] ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction(1);
          }}
          className="rounded-full border border-white/25 bg-black/40 px-4 py-3.5 text-[13px] font-semibold text-white transition active:scale-[0.98] hover:bg-white/10"
        >
          {secondaryLabel}
        </button>
      ) : null}

      {item.whopUrl && (
        <a
          href={item.whopUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center rounded-full border border-white/25 bg-black/40 px-4 py-3.5 text-[13px] font-semibold text-white hover:bg-white/10"
          aria-label="Open on Whop"
        >
          Whop ↗
        </a>
      )}
    </div>
  );
}
