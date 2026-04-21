import { NextResponse } from "next/server";
import { getLinkedInProfile } from "@/lib/maton";

export async function GET() {
  try {
    const profile = await getLinkedInProfile();
    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
