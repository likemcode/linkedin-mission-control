import { getLinkedInProfile } from "@/lib/maton";

export async function GET() {
  const matonConfigured = Boolean(process.env.MATON_API_KEY);
  const authorConfigured = Boolean(process.env.LINKEDIN_AUTHOR_URN);
  const connectionPinned = Boolean(process.env.MATON_CONNECTION_ID);
  const apiMode = process.env.MATON_API_VERSION === "v1" ? "v1" : "gateway";

  let profile: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    authorUrn?: string;
    connected: boolean;
  } | null = null;

  if (matonConfigured) {
    try {
      const data = await getLinkedInProfile();
      const personId = data.id || data.personUrn;
      profile = {
        firstName: data.localizedFirstName || data.firstName?.localized?.fr_FR,
        lastName: data.localizedLastName || data.lastName?.localized?.fr_FR,
        headline: data.localizedHeadline || data.headline?.localized?.fr_FR,
        authorUrn: personId ? `urn:li:person:${personId}` : undefined,
        connected: Boolean(personId),
      };
    } catch {
      profile = { connected: false };
    }
  }

  return Response.json({
    matonConfigured,
    authorConfigured,
    connectionPinned,
    apiMode,
    profile,
  });
}
