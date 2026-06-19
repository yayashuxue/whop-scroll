import { NextResponse } from "next/server";

export const runtime = "nodejs";

function originFromReq(req: Request): string {
  const env = process.env.WHOP_OAUTH_REDIRECT_ORIGIN;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

function readCookie(req: Request, name: string): string | undefined {
  return req.headers
    .get("cookie")
    ?.split(/;\s*/)
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
};

type WhopUserInfo = {
  sub?: string;
  name?: string;
  preferred_username?: string;
  picture?: string;
  email?: string;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const err = url.searchParams.get("error");
  if (err) {
    return NextResponse.redirect(`${originFromReq(req)}/studio?login=failed`, 302);
  }

  const cookieState = readCookie(req, "whop_oauth_state");
  const codeVerifier = readCookie(req, "whop_oauth_verifier");
  if (!code || !stateParam || !cookieState || !codeVerifier || stateParam !== cookieState) {
    return NextResponse.redirect(`${originFromReq(req)}/studio?login=failed`, 302);
  }

  const clientId = process.env.WHOP_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${originFromReq(req)}/studio?login=config`, 302);
  }

  const redirectUri = `${originFromReq(req)}/api/oauth/callback`;
  const tokenRes = await fetch("https://api.whop.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${originFromReq(req)}/studio?login=token`, 302);
  }
  const tok = (await tokenRes.json()) as TokenResponse;
  if (!tok.access_token) {
    return NextResponse.redirect(`${originFromReq(req)}/studio?login=token`, 302);
  }

  let user: WhopUserInfo | null = null;
  try {
    const meRes = await fetch("https://api.whop.com/oauth/userinfo", {
      headers: {
        Authorization: `Bearer ${tok.access_token}`,
        Accept: "application/json",
      },
    });
    if (meRes.ok) user = (await meRes.json()) as WhopUserInfo;
  } catch {
    user = null;
  }

  const res = NextResponse.redirect(`${originFromReq(req)}/?login=ok`, 302);
  const maxAge = tok.expires_in ?? 60 * 60;
  res.cookies.set("whop_session", tok.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  if (tok.refresh_token) {
    res.cookies.set("whop_refresh", tok.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  // Always set whop_user — the TopBar dropdown gates on this cookie, so even if
  // userinfo fetch fell over (missing scope, transient API issue) we still want
  // the UI to reflect that the user is signed in.
  const handle = user?.preferred_username
    ? `@${user.preferred_username}`
    : user?.sub
      ? `@${user.sub}`
      : "@whop-user";
  // Pass the raw JSON string — Next.js URL-encodes cookie values itself.
  // Pre-encoding here would double-encode, and the client reader's single
  // decodeURIComponent + JSON.parse would then always throw (so the UI would
  // never reflect the signed-in user).
  res.cookies.set(
    "whop_user",
    JSON.stringify({
      id: user?.sub ?? "",
      name: user?.name ?? user?.preferred_username ?? "Whop user",
      handle,
      avatar: user?.picture ?? "",
    }),
    {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    },
  );
  res.cookies.set("whop_oauth_state", "", { path: "/", maxAge: 0 });
  res.cookies.set("whop_oauth_verifier", "", { path: "/", maxAge: 0 });
  return res;
}
