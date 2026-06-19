import { NextResponse } from "next/server";

export const runtime = "nodejs";

function readCookie(req: Request, name: string): string | undefined {
  return req.headers
    .get("cookie")
    ?.split(/;\s*/)
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function revokeIfPossible(req: Request) {
  const refresh = readCookie(req, "whop_refresh");
  const clientId = process.env.WHOP_OAUTH_CLIENT_ID;
  if (!refresh || !clientId) return;
  try {
    await fetch("https://api.whop.com/oauth/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refresh, client_id: clientId }),
    });
  } catch {
    // swallow — local cookies still get cleared
  }
}

function clearAll(res: NextResponse) {
  for (const name of ["whop_session", "whop_refresh", "whop_user"]) {
    res.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return res;
}

export async function POST(req: Request) {
  await revokeIfPossible(req);
  return clearAll(NextResponse.json({ ok: true }));
}

export async function GET(req: Request) {
  await revokeIfPossible(req);
  const url = new URL(req.url);
  return clearAll(NextResponse.redirect(`${url.protocol}//${url.host}/`, 302));
}
