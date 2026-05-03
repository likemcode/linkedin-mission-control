import { NextResponse } from "next/server";
import { getLinkedInProfile } from "@/lib/maton";

function normalizePersonUrn(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("urn:li:person:") ? trimmed : null;
}

export async function GET() {
  if (!process.env.MATON_API_KEY) {
    return NextResponse.json(
      { error: "MATON_API_KEY not configured", code: "NO_API_KEY" },
      { status: 200 },
    );
  }

  try {
    const profile = await getLinkedInProfile();
    const authorUrn = normalizePersonUrn(profile.authorUrn || profile.personUrn)
      ?? (profile.id ? `urn:li:person:${profile.id}` : null);

    return NextResponse.json({
      firstName: profile.firstName?.localized?.fr_FR || profile.localizedFirstName,
      lastName: profile.lastName?.localized?.fr_FR || profile.localizedLastName,
      headline: profile.headline?.localized?.fr_FR || profile.localizedHeadline,
      profilePicture:
        profile.profilePicture?.displayImage || profile.profilePicture,
      vanityName: profile.vanityName,
      authorUrn,
      connected: !!authorUrn,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    return NextResponse.json({ error: message, connected: false }, { status: 200 });
  }
}
