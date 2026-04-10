const MATON_API_BASE = "https://api.maton.ai/v1";

async function matonFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${MATON_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MATON_API_KEY}`,
      "LinkedIn-Version": "202506",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Maton API error ${res.status}: ${body}`);
  }

  return res.json();
}

export async function publishToLinkedIn(content: string) {
  return matonFetch("/linkedin/posts", {
    method: "POST",
    body: JSON.stringify({
      commentary: content,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
      },
    }),
  });
}

export async function getLinkedInProfile() {
  return matonFetch("/linkedin/me");
}
