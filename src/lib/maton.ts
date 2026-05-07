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

export async function publishToLinkedIn(content: string, mediaUrn?: string) {
  return matonFetch("/linkedin/posts", {
    method: "POST",
    body: JSON.stringify({
      commentary: content,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
      },
      content: mediaUrn ? {
        media: {
          id: mediaUrn,
        }
      } : undefined,
    }),
  });
}

export async function uploadImageToLinkedIn(imageBuffer: Buffer, contentType: string) {
  const res = await fetch(`${MATON_API_BASE}/linkedin/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MATON_API_KEY}`,
      "LinkedIn-Version": "202506",
      "Content-Type": contentType,
    },
    body: imageBuffer as unknown as BodyInit,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Maton API error ${res.status}: ${body}`);
  }

  return res.json(); // { urn: "urn:li:image:123" }
}

export async function getLinkedInProfile() {
  return matonFetch("/linkedin/me");
}

export async function uploadDocumentToLinkedIn(fileBuffer: Buffer, fileName: string, contentType: string) {
  const res = await fetch(`${MATON_API_BASE}/linkedin/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MATON_API_KEY}`,
      "LinkedIn-Version": "202506",
      "Content-Type": contentType,
      "X-Filename": fileName,
    },
    body: fileBuffer as unknown as BodyInit,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Maton API error ${res.status}: ${body}`);
  }

  return res.json(); // { urn: "urn:li:document:123" }
}

export async function uploadMultipleImagesToLinkedIn(
  images: { buffer: Buffer; contentType: string }[]
) {
  const results = await Promise.all(
    images.map((img) => uploadImageToLinkedIn(img.buffer, img.contentType))
  );
  return results;
}
