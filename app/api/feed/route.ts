import { executeFeedAction, getFeed, getWallet } from "@/lib/feed";
import { errorResponse } from "@/lib/whop";

export async function GET() {
  const feed = await getFeed();
  return Response.json({ feed, wallet: getWallet() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const wallet = await executeFeedAction(body);
    return Response.json({ wallet });
  } catch (error) {
    return errorResponse(error);
  }
}
