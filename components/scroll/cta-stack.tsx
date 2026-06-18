"use client";

import type { FeedItem, CtaKind } from "@/lib/seed-creators";

const ICON: Record<CtaKind, string> = {
  subscribe: "✦",
  tip: "♥",
  swap: "⇄",
  yield: "%",
  deposit: "↓",
  mirror: "⎘",
};

export function CtaStack({
  item,
  onAction,
}: {
  item: FeedItem;
  onAction: (ctaIndex: number) => void;
}) {
  return (
    <div className="flex w-20 flex-col items-stretch gap-3">
      {item.ctas.map((cta, i) => (
        <button
          key={`${cta.kind}-${i}`}
          onClick={(e) => {
            e.stopPropagation();
            onAction(i);
          }}
          className="group flex flex-col items-center gap-1 rounded-2xl border border-white/20 bg-white/10 px-2 py-3 text-white backdrop-blur transition active:scale-95 hover:bg-white/20"
        >
          <span className="text-xl leading-none">{ICON[cta.kind]}</span>
          <span className="text-[10px] font-semibold leading-tight">
            {cta.label}
          </span>
        </button>
      ))}
    </div>
  );
}
