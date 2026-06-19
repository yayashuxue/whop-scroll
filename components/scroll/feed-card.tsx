"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { WhopNativePoster } from "./whop-native-poster";
import { CreativePoster } from "./creative-poster";
import type { FeedItem } from "@/lib/seed-creators";

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
  muted = true,
  onToggleMute,
  onAction,
}: {
  item: FeedItem;
  muted?: boolean;
  onToggleMute?: () => void;
  onAction: (ctaIndex: number) => void;
}) {
  const isNative = item.kind === "whop_native";
  // Composable creative routing: video > native simulated UI > creative app card
  // (creator-first default) > semi-static poster fallback.
  const useCreativePoster = !item.videoUrl && !isNative && !item.useStaticPoster;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Pause the video when its card is scrolled off-screen so audio from the
  // previous card doesn't keep playing while the user is on a new one.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // 0.75 threshold so only the snap-centered card plays. Below this we
          // pause + rewind so the next time the card scrolls back into view it
          // restarts from the hook, not mid-clip.
          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            el.play().catch(() => undefined);
          } else {
            el.pause();
            if (el.currentTime > 0.1) el.currentTime = 0;
          }
        }
      },
      { threshold: [0, 0.75, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function openWhop() {
    if (item.whopUrl) {
      window.open(item.whopUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div
      style={{ height: "100%", width: "100%" }}
      className="relative overflow-hidden bg-black"
      onClick={openWhop}
    >
      {item.videoUrl ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-95"
          src={item.videoUrl}
          poster={item.posterUrl}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="auto"
        />
      ) : isNative ? (
        <WhopNativePoster item={item} />
      ) : useCreativePoster ? (
        <CreativePoster item={item} />
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

      {item.videoUrl && onToggleMute ? (
        <button
          type="button"
          data-mute-toggle="true"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      ) : null}

      {/* Bottom-up scrim. For native cards the scrim is heavier so the simulated UI
          stays readable behind the copy. */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isNative
            ? "bg-gradient-to-b from-black/40 via-black/20 to-black"
            : "bg-gradient-to-b from-black/30 via-black/5 to-black/90"
        }`}
      />

      {/* Bottom content block. On short viewports the pitch and meta row
          collapse so creator + title + CTA always fit above the home bar.
          CTA stays inside safe-area; content stack pads up to clear it. */}
      <div
        className="fade-rise absolute inset-x-0 bottom-0 space-y-2.5 px-4 pt-4 sm:space-y-3 sm:px-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
      >
        <div className="flex items-center gap-2 text-white">
          <CreatorAvatar item={item} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold leading-tight">
              {item.creator}
            </div>
            <div className="truncate text-[11px] text-white/55">
              {item.handle}
            </div>
          </div>
        </div>

        <div className="space-y-1 text-white [@media(min-height:680px)]:space-y-1.5">
          <h2 className="line-clamp-2 text-[22px] font-bold leading-[1.1] tracking-tight [@media(min-height:680px)]:text-[24px]">
            {item.title}
          </h2>
          <p className="hidden line-clamp-2 text-[13px] text-white/75 [@media(min-height:680px)]:block">
            {item.pitch}
          </p>
        </div>

        <div className={item.ctas[1] ? "grid grid-cols-2 gap-2" : ""}>
          <PrimaryCta
            item={item}
            label={primaryLabel(item)}
            onAction={onAction}
          />
          {item.ctas[1] ? (
            <SecondaryCta
              item={item}
              label={item.ctas[1].label}
              onAction={onAction}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PrimaryCta({
  item,
  label,
  onAction,
}: {
  item: FeedItem;
  label: string;
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
    <button
      type="button"
      onClick={handlePrimary}
      className="block w-full truncate rounded-full bg-[#c1fa81] px-4 py-3 text-center text-[14px] font-bold text-black transition active:scale-[0.98] hover:bg-[#d2fc94] [@media(min-height:680px)]:py-3.5 [@media(min-height:680px)]:text-[15px]"
    >
      {label}
    </button>
  );
}

function SecondaryCta({
  item,
  label,
  onAction,
}: {
  item: FeedItem;
  label: string;
  onAction: (ctaIndex: number) => void;
}) {
  function handleSecondary(e: React.MouseEvent) {
    e.stopPropagation();
    if (item.whopUrl) {
      window.open(item.whopUrl, "_blank", "noopener,noreferrer");
    }
    onAction(1);
  }
  return (
    <button
      type="button"
      onClick={handleSecondary}
      className="block w-full truncate rounded-full border border-white/35 bg-white/5 px-4 py-3 text-center text-[14px] font-semibold text-white backdrop-blur-sm transition active:scale-[0.98] hover:bg-white/15 [@media(min-height:680px)]:py-3.5 [@media(min-height:680px)]:text-[15px]"
    >
      {label}
    </button>
  );
}

// Avatar with creator-initial monogram fallback. When the FeedItem only has a
// dicebear shape URL (no real logo or owner profile picture), the generative
// shape feels off-brand — a colored monogram looks more like a real creator
// placeholder. We render the real avatar if it's hosted on Whop's CDN (logo or
// profile_picture) and fall back to a deterministic colored monogram otherwise.
function CreatorAvatar({ item }: { item: FeedItem }) {
  const url = item.avatar;
  const isWhopCdn = url.includes("whop.com");
  if (isWhopCdn) {
    return (
      <Image
        src={url}
        alt={item.creator}
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full border border-white/30 bg-white/10 object-cover"
        unoptimized
      />
    );
  }
  // Monogram fallback: first 1-2 chars of creator name on chartreuse pill.
  const initial = item.creator.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/30 bg-[#c1fa81] text-[14px] font-bold text-black"
      aria-label={item.creator}
    >
      {initial}
    </div>
  );
}
