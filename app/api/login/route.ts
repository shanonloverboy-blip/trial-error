import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";
  const expected = process.env.APP_PASSCODE;

  if (!expected) {
    return NextResponse.json(
      { error: "APP_PASSCODE belum diset di environment variables server." },
      { status: 500 }
    );
  }

  if (passcode !== expected) {
    return NextResponse.json({ error: "Kode akses salah." }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
