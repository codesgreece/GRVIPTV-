import { NextResponse } from "next/server";
import {
  assertNoCredentialsInPayload,
  getChannelsPayload,
  LiveChannelsError,
} from "@/lib/live/channels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("refresh") === "1";

    const payload = await getChannelsPayload({ force });
    assertNoCredentialsInPayload(payload, process.env.M3U_URL);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=240",
      },
    });
  } catch (error) {
    const message =
      error instanceof LiveChannelsError
        ? error.message
        : "Unable to load channels";

    return NextResponse.json(
      { error: true, message },
      {
        status:
          error instanceof LiveChannelsError && message.includes("not configured")
            ? 503
            : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
