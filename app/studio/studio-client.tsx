"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { MyCampaign, PosterTemplate } from "@/lib/studio-templates";

type CtaKind = "subscribe" | "tip";

export function StudioClient({
  campaigns,
  templates,
}: {
  campaigns: MyCampaign[];
  templates: PosterTemplate[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [connected, setConnected] = useState(false);
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [creator, setCreator] = useState("");
  const [handle, setHandle] = useState("@");
  const [ctaKind, setCtaKind] = useState<CtaKind>("subscribe");
  const [ctaAmount, setCtaAmount] = useState(29);
  const [videoDataUrl, setVideoDataUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === campaignId) ?? campaigns[0],
    [campaigns, campaignId],
  );
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? templates[0],
    [templates, templateId],
  );

  // Auto-fill defaults from the picked campaign once.
  function pickCampaign(id: string) {
    setCampaignId(id);
    const c = campaigns.find((x) => x.id === id);
    if (!c) return;
    if (!creator) setCreator(c.name);
    if (handle === "@" || !handle)
      setHandle(`@${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`);
    if (!title) setTitle(`Inside ${c.name}`);
    if (!pitch) setPitch(c.product);
    setCtaAmount(c.priceUsd);
  }

  async function onVideoPicked(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Video over 4MB — pick a shorter clip or use a template");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setVideoDataUrl(reader.result as string);
      setVideoName(file.name);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!selectedCampaign || !selectedTemplate) return;
    if (!title || !pitch) {
      toast.error("Title and pitch required");
      return;
    }
    setSubmitting(true);
    const t = toast.loading("Promoting to feed…");
    try {
      const res = await fetch("/api/studio/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          creator: creator || selectedCampaign.name,
          handle: handle || `@${selectedCampaign.id}`,
          title,
          pitch,
          posterUrl: selectedTemplate.posterUrl,
          videoUrl: videoDataUrl ?? undefined,
          priceUsd: selectedCampaign.priceUsd,
          ctaKind,
          ctaAmount,
        }),
      });
      if (!res.ok) throw new Error("Promote failed");
      toast.success("Live in feed", { id: t });
      setTimeout(() => router.push("/"), 400);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed", { id: t });
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-5 pb-32 pt-6">
        <header className="space-y-3 pb-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              whop scroll · studio
            </div>
            <Link
              href="/"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/80 hover:bg-white/10"
            >
              ← Feed
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Promote a campaign</h1>
            <button
              type="button"
              onClick={() => {
                setConnected(true);
                toast.success("Connected · loaded 3 campaigns");
              }}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
                connected
                  ? "border border-[#c1fa81]/40 bg-[#c1fa81]/15 text-[#c1fa81]"
                  : "bg-white text-black hover:bg-white/85"
              }`}
            >
              {connected ? "✓ @prophub" : "Whop login"}
            </button>
          </div>
        </header>

        <section className="space-y-2 pb-6">
          <label className="text-[11px] uppercase tracking-wider text-white/50">
            1 · Your campaign
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {campaigns.map((c) => {
              const active = campaignId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickCampaign(c.id)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-[#c1fa81] bg-[#c1fa81]/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/30"
                  }`}
                >
                  <div className="text-xl">{c.emoji}</div>
                  <div className="mt-1 text-sm font-semibold">{c.name}</div>
                  <div className="text-[11px] text-white/55">{c.product}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40">
                    <span>${c.priceUsd}/mo</span>
                    <span>{c.members.toLocaleString()} members</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2 pb-6">
          <div className="flex items-baseline justify-between">
            <label className="text-[11px] uppercase tracking-wider text-white/50">
              2 · Asset
            </label>
            <span className="text-[10px] text-white/40">
              upload a vertical clip or pick a default template
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {templates.map((t) => {
              const active = templateId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTemplateId(t.id);
                    setVideoDataUrl(null);
                    setVideoName(null);
                  }}
                  className={`group relative aspect-[9/16] overflow-hidden rounded-xl border ${
                    active && !videoDataUrl
                      ? "border-[#c1fa81]"
                      : "border-white/10 hover:border-white/40"
                  }`}
                >
                  <Image
                    src={t.posterUrl}
                    alt={t.label}
                    fill
                    sizes="120px"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2 text-left">
                    <div className="text-[11px] font-semibold">{t.label}</div>
                    <div className="text-[9px] text-white/60">{t.vibe}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onVideoPicked(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[12px] hover:bg-white/10"
            >
              {videoDataUrl ? "Replace video" : "Upload vertical video"}
            </button>
            {videoName && (
              <span className="truncate text-[11px] text-[#c1fa81]">
                ✓ {videoName}
              </span>
            )}
            <span className="ml-auto text-[10px] text-white/40">≤ 4MB</span>
          </div>
        </section>

        <section className="space-y-3 pb-6">
          <label className="text-[11px] uppercase tracking-wider text-white/50">
            3 · Pitch
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field
              label="Creator name"
              value={creator}
              onChange={setCreator}
              placeholder="Maya · AI fitness"
            />
            <Field
              label="Handle"
              value={handle}
              onChange={setHandle}
              placeholder="@mayalifts"
            />
          </div>
          <Field
            label="Title (hook)"
            value={title}
            onChange={setTitle}
            placeholder="AI cuts 40hr/wk for a creator"
          />
          <Field
            label="Pitch (1-2 sentences)"
            value={pitch}
            onChange={setPitch}
            multiline
            placeholder="30s pitch. Subscribe for the full toolkit."
          />
        </section>

        <section className="space-y-3 pb-8">
          <label className="text-[11px] uppercase tracking-wider text-white/50">
            4 · Wallet CTA
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={ctaKind}
              onChange={(e) => setCtaKind(e.target.value as CtaKind)}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm"
            >
              <option value="subscribe">Subscribe</option>
              <option value="tip">Tip</option>
            </select>
            <span className="text-white/40">·</span>
            <input
              type="number"
              value={ctaAmount}
              min={1}
              onChange={(e) => setCtaAmount(Number(e.target.value))}
              className="w-24 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm"
            />
            <span className="text-sm text-white/60">USDC</span>
            <span className="ml-auto text-[10px] text-white/40">
              Settles via Whop API · falls back to demo
            </span>
          </div>
        </section>

        <div className="sticky bottom-3 z-20 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/85 p-2.5 backdrop-blur">
          <PreviewBadge
            posterUrl={
              videoDataUrl ? "" : selectedTemplate?.posterUrl ?? ""
            }
            video={videoDataUrl}
            kind={videoDataUrl ? "custom" : "template"}
          />
          <div className="flex-1 text-xs text-white/70">
            <div className="font-semibold text-white">
              {title || "Your title here"}
            </div>
            <div className="truncate">
              {creator || "Creator"} · ${ctaAmount}/{ctaKind === "subscribe" ? "mo" : "tip"}
            </div>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="rounded-full bg-[#c1fa81] px-4 py-2 text-sm font-bold text-black hover:bg-[#d8fea3] disabled:opacity-50"
          >
            {submitting ? "Promoting…" : "Promote → Feed"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="block pb-1 text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
        />
      )}
    </label>
  );
}

function PreviewBadge({
  posterUrl,
  video,
  kind,
}: {
  posterUrl: string;
  video: string | null;
  kind: "template" | "custom";
}) {
  return (
    <div className="relative h-14 w-9 overflow-hidden rounded-lg border border-white/15 bg-black">
      {video ? (
        <video src={video} muted playsInline className="h-full w-full object-cover" />
      ) : posterUrl ? (
        <Image
          src={posterUrl}
          alt="preview"
          fill
          sizes="36px"
          className="object-cover"
          unoptimized
        />
      ) : null}
      <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-center text-[7px] uppercase tracking-wider text-white/80">
        {kind}
      </span>
    </div>
  );
}
