import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

export const runtime = "nodejs";

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function originFromReq(req: Request): string {
  const env = process.env.WHOP_OAUTH_REDIRECT_ORIGIN;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(req: Request) {
  const clientId = process.env.WHOP_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "WHOP_OAUTH_CLIENT_ID missing — register an app at whop.com/dashboard/developer and add env vars" },
      { status: 500 },
    );
  }

  const codeVerifier = base64url(randomBytes(32));
  const codeChallenge = base64url(
    createHash("sha256").update(codeVerifier).digest(),
  );
  const state = base64url(randomBytes(16));
  const nonce = base64url(randomBytes(16));
  const redirectUri = `${originFromReq(req)}/api/oauth/callback`;

  const authorize = new URL("https://api.whop.com/oauth/authorize");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", "openid profile email");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("nonce", nonce);
  authorize.searchParams.set("code_challenge", codeChallenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(authorize.toString(), 302);
  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  };
  res.cookies.set("whop_oauth_state", state, cookieOpts);
  res.cookies.set("whop_oauth_verifier", codeVerifier, cookieOpts);
  return res;
}
