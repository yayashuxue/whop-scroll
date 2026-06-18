import { executeFeedAction, getFeed, getWallet } from "@/lib/feed";
import { errorResponse } from "@/lib/whop";

export async function GET() {
  return Response.json({ feed: getFeed(), wallet: getWallet() });
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
