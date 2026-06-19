"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { WalletState } from "@/lib/feed";

type WhopUser = { id: string; name: string; handle: string; avatar: string };

function readWhopUser(): WhopUser | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split(/;\s*/)
    .find((c) => c.startsWith("whop_user="))
    ?.slice("whop_user=".length);
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as WhopUser;
  } catch {
    return null;
  }
}

export function TopBar({ wallet: _wallet }: { wallet: WalletState | null }) {
  const [user, setUser] = useState<WhopUser | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setUser(readWhopUser());
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-end gap-2 px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
      {user ? (
        <div ref={dropdownRef} className="pointer-events-auto relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-2.5 py-1.5 text-[13px] font-semibold text-white backdrop-blur-sm hover:bg-black/60"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            {user.avatar ? (
              // unoptimized to avoid next/image domain config drift
              <img
                src={user.avatar}
                alt={user.name}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#c1fa81] text-[11px] font-bold text-black">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="max-w-[120px] truncate">
              {user.handle || user.name}
            </span>
            <span className="text-white/50">▾</span>
          </button>
          {open ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-white/15 bg-black/85 text-white shadow-xl backdrop-blur-md"
            >
              <Link
                href="/studio"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-[13px] hover:bg-white/10"
              >
                Promote my app
              </Link>
              <a
                href="/api/oauth/logout"
                role="menuitem"
                className="block border-t border-white/10 px-3 py-2 text-[13px] text-red-300 hover:bg-white/10"
              >
                Log out
              </a>
            </div>
          ) : null}
        </div>
      ) : (
        <a
          href="/api/oauth/start"
          className="pointer-events-auto rounded-full bg-[#c1fa81] px-4 py-2 text-[13px] font-bold text-black hover:bg-[#d2fc94]"
        >
          Login with Whop
        </a>
      )}
    </div>
  );
}
