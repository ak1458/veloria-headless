import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    version: "1.0.1",
    timestamp: new Date().toISOString(),
    message: "Bug fixes deployed (variation fallbacks + URL sync)"
  });
}
