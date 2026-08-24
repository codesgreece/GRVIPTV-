import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminAuthRequired,
  createAdminSessionValue,
  isAdminPasswordConfigured,
  verifyAdminPassword,
} from "@/lib/customers/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let password = "";

  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Μη έγκυρο αίτημα." }, { status: 400 });
  }

  if (adminAuthRequired() && !isAdminPasswordConfigured()) {
    return NextResponse.json(
      { error: "Ορίστε το ADMIN_GR_PASSWORD στο Vercel για πρόσβαση στο admin." },
      { status: 503 },
    );
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Λάθος κωδικός." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
