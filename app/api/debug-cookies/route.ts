import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({
    cookies: Object.fromEntries(request.headers.get("cookie")?.split("; ").map(c => c.split("=")) || [])
  });
}