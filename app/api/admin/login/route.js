import { NextResponse } from "next/server";
import { createSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      {
        success: false,
        message: "ADMIN_PASSWORD is not configured on the server. Set it in .env.local.",
      },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const { password } = body ?? {};

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ success: false, message: "Password is required." }, { status: 400 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true });

  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days, keep in sync with lib/auth.js
  });

  return response;
}
