"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type CtaInput = { label: string; url: string };

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

export function StudioClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [connected, setConnected] = useState(false);
  const [whopHandle, setWhopHandle] = useState<string | null>(null);
  const [whopName, setWhopName] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [primary, setPrimary] = useState<CtaInput>({ label: "", url: "" });
  const [secondary, setSecondary] = useState<CtaInput>({ label: "", url: "" });
  const [useSecondary, setUseSecondary] = useState(false);
  const [videoDataUrl, setVideoDataUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = document.cookie
      .split(/;\s*/)
      .find((c) => c.startsWith("whop_user="))
      ?.slice("whop_user=".length);
    if (raw) {
      try {
        const u = JSON.parse(decodeURIComponent(raw)) as {
          name?: string;
          handle?: string;
        };
        if (u.handle || u.name) {
          setConnected(true);
          setWhopHandle(u.handle ?? null);
          setWhopName(u.name ?? null);
        }
      } catch {
        // ignore
      }
    }
    const login = new URLSearchParams(window.location.search).get("login");
    if (login === "ok") toast.success("Connected to Whop");
    else if (login === "failed") toast.error("Login failed · state mismatch");
    else if (login === "token") toast.error("Login failed · token exchange");
    else if (login === "config")
      toast.error("Login not configured · set WHOP_OAUTH_CLIENT_ID");
  }, []);

  async function onVideoPicked(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Video over 4MB — pick a shorter clip");
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
    if (!title || !pitch) {
      toast.error("Title and pitch required");
      return;
    }
    if (!primary.label || !primary.url) {
      toast.error("Primary CTA needs a label and a whop.com URL");
      return;
    }
    if (!isWhopUrl(primary.url)) {
      toast.error("CTA must link to whop.com");
      return;
    }
    if (useSecondary && (!secondary.label || !secondary.url)) {
      toast.error("Second CTA needs label + URL — or turn it off");
      return;
    }
    if (useSecondary && !isWhopUrl(secondary.url)) {
      toast.error("Second CTA must link to whop.com");
      return;
    }

    setSubmitting(true);
    const t = toast.loading("Promoting to feed…");
    try {
      const res = await fetch("/api/studio/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator: whopName ?? "Whop creator",
          handle: whopHandle ?? "@whop-user",
          title,
          pitch,
          videoUrl: videoDataUrl ?? undefined,
          ctas: useSecondary ? [primary, secondary] : [primary],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Promote failed");
      // Persist locally too — the server keeps userPromoted in-memory and a
      // redeploy / cold start wipes it. localStorage means julie's promo
      // survives across reloads and deploys for the demo.
      try {
        const KEY = "whop_scroll_promoted_v1";
        const existing = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown[];
        const next = [data.item, ...existing].slice(0, 12);
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore quota / private mode failures
      }
      toast.success("Live in feed", { id: t });
      setTimeout(() => router.push("/"), 400);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed", { id: t });
      setSubmitting(false);
    }
  }

  const primaryUrlValid = !primary.url || isWhopUrl(primary.url);
  const secondaryUrlValid = !secondary.url || isWhopUrl(secondary.url);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-xl px-5 pb-32 pt-6">
        <header className="flex items-center justify-between pb-8">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.18em] text-white/40 hover:text-white/70"
          >
            ← feed
          </Link>
          {connected ? (
            <span className="rounded-full border border-[#c1fa81]/40 bg-[#c1fa81]/15 px-3 py-1.5 text-[12px] font-semibold text-[#c1fa81]">
              ✓ {whopHandle ?? "Connected"}
            </span>
          ) : (
            <a
              href="/api/oauth/start"
              className="rounded-full bg-[#c1fa81] px-3 py-1.5 text-[12px] font-bold text-black hover:bg-[#d2fc94]"
            >
              Login with Whop
            </a>
          )}
        </header>

        <h1 className="pb-1 text-3xl font-bold leading-tight">
          Promote on the feed
        </h1>
        <p className="pb-8 text-sm text-white/55">
          Drop a clip, write the hook, link your Whop. Live in seconds.
        </p>

        <section className="space-y-5">
          <div>
            <UploadDrop
              videoName={videoName}
              videoDataUrl={videoDataUrl}
              onPick={() => fileInputRef.current?.click()}
              onClear={() => {
                setVideoDataUrl(null);
                setVideoName(null);
              }}
            />
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
          </div>

          <Field
            label="Hook"
            value={title}
            onChange={setTitle}
            placeholder="17 and $1.14M/mo — App Store receipts"
          />
          <Field
            label="Pitch"
            value={pitch}
            onChange={setPitch}
            multiline
            placeholder="One or two lines on why someone should tap."
          />

          <div className="space-y-2 pt-2">
            <div className="text-[11px] uppercase tracking-wider text-white/50">
              CTA
            </div>
            <CtaRow
              cta={primary}
              urlValid={primaryUrlValid}
              onChange={setPrimary}
              labelPlaceholder="Join Streamer Clips"
              urlPlaceholder="https://whop.com/streamer-clips/"
            />
            {useSecondary ? (
              <>
                <CtaRow
                  cta={secondary}
                  urlValid={secondaryUrlValid}
                  onChange={setSecondary}
                  labelPlaceholder="Tip $1"
                  urlPlaceholder="https://whop.com/your-tip-page/"
                />
                <button
                  type="button"
                  onClick={() => setUseSecondary(false)}
                  className="text-[11px] text-white/40 hover:text-white/70"
                >
                  × remove second CTA
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setUseSecondary(true)}
                className="text-[11px] text-white/55 hover:text-white"
              >
                + add a second CTA
              </button>
            )}
            <p className="pt-1 text-[10px] text-white/35">
              Links must be on whop.com — we&apos;ll reject anything else.
            </p>
          </div>
        </section>

        <div className="sticky bottom-3 z-20 mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/85 p-3 backdrop-blur">
          <div className="flex-1 truncate text-xs text-white/70">
            <div className="font-semibold text-white">
              {title || "Your hook here"}
            </div>
            <div className="truncate">
              {(whopName ?? "Whop creator")} ·{" "}
              {primary.label || "Primary CTA"}
            </div>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="rounded-full bg-[#c1fa81] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#d8fea3] active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Promoting…" : "Promote → Feed"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadDrop({
  videoName,
  videoDataUrl,
  onPick,
  onClear,
}: {
  videoName: string | null;
  videoDataUrl: string | null;
  onPick: () => void;
  onClear: () => void;
}) {
  if (videoDataUrl) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#c1fa81]/40 bg-[#c1fa81]/[0.06] p-3">
        <video
          src={videoDataUrl}
          muted
          playsInline
          className="h-16 w-10 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1 text-[12px]">
          <div className="truncate font-semibold text-[#c1fa81]">
            ✓ {videoName}
          </div>
          <div className="text-white/40">Will autoplay in the feed</div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/10"
        >
          replace
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onPick}
      className="grid w-full place-items-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] py-10 text-center hover:border-white/40"
    >
      <div className="text-3xl">⬆️</div>
      <div className="pt-2 text-sm font-semibold">Drop a vertical clip</div>
      <div className="text-[11px] text-white/40">9:16, ≤ 4MB · optional</div>
    </button>
  );
}

function CtaRow({
  cta,
  urlValid,
  onChange,
  labelPlaceholder,
  urlPlaceholder,
}: {
  cta: CtaInput;
  urlValid: boolean;
  onChange: (v: CtaInput) => void;
  labelPlaceholder: string;
  urlPlaceholder: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr]">
      <input
        value={cta.label}
        onChange={(e) => onChange({ ...cta, label: e.target.value })}
        placeholder={labelPlaceholder}
        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none"
      />
      <input
        value={cta.url}
        onChange={(e) => onChange({ ...cta, url: e.target.value })}
        placeholder={urlPlaceholder}
        className={`rounded-xl border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none ${
          urlValid
            ? "border-white/15 focus:border-white/40"
            : "border-red-400/60 focus:border-red-400"
        }`}
      />
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
      <span className="block pb-1 text-[11px] uppercase tracking-wider text-white/50">
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
