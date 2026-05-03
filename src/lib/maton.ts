/**
 * Maton Gateway — LinkedIn REST API client.
 * Maton proxies api.linkedin.com, injects OAuth tokens automatically.
 *
 * Docs: https://gateway.maton.ai/linkedin/rest/{resource}
 * Connection management: https://ctrl.maton.ai
 */

const MATON_GATEWAY = "https://gateway.maton.ai/linkedin/rest";

// Fallback to old v1 API if MATON_API_VERSION=v1 is set
const MATON_V1_BASE = "https://api.maton.ai/v1";

function isV1(): boolean {
  return process.env.MATON_API_VERSION === "v1";
}

function matonHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${process.env.MATON_API_KEY}`,
  };
  if (!isV1()) {
    h["LinkedIn-Version"] = "202506";
    h["X-Restli-Protocol-Version"] = "2.0.0";
    h["Content-Type"] = "application/json";
  } else {
    h["Content-Type"] = "application/json";
    h["LinkedIn-Version"] = "202506";
  }
  // Optional: pin to a specific Maton connection
  if (process.env.MATON_CONNECTION_ID) {
    h["Maton-Connection"] = process.env.MATON_CONNECTION_ID;
  }
  return h;
}

async function matonFetch(path: string, options: RequestInit = {}) {
  const base = isV1() ? MATON_V1_BASE : MATON_GATEWAY;
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...matonHeaders(), ...options.headers },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Maton error ${res.status}: ${body}`);
  }

  return res;
}

// ── Connections ──

export async function listConnections() {
  const res = await matonFetch("/connections");
  return res.json();
}

// ── Profile ──

export async function getLinkedInProfile() {
  // Gateway: GET /me returns the authenticated user's LinkedIn profile
  // V1: GET /linkedin/me
  const path = isV1() ? "/linkedin/me" : "/me";
  const res = await matonFetch(path);
  return res.json();
}

// ── Publish Post (text only) ──

type PublishOptions = {
  author?: string; // Optional: Maton injects the right author from the connection
  commentary: string;
  visibility?: "PUBLIC" | "CONNECTIONS";
  mediaUrn?: string;
  mediaAltText?: string;
};

export async function publishToLinkedIn(opts: PublishOptions) {
  if (isV1()) {
    // Old v1 API format
    const body: Record<string, unknown> = {
      commentary: opts.commentary,
      visibility: opts.visibility || "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED" },
    };
    if (opts.mediaUrn) {
      body.content = { media: { id: opts.mediaUrn } };
    }
    const res = await matonFetch("/linkedin/posts", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.json();
  }

  // Gateway: POST /posts
  const body: Record<string, unknown> = {
    commentary: opts.commentary,
    visibility: opts.visibility || "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };
  // Only add author if provided (Maton injects it from the connection otherwise)
  if (opts.author) {
    body.author = opts.author;
  }

  if (opts.mediaUrn) {
    body.content = {
      media: {
        altText: opts.mediaAltText || "",
        id: opts.mediaUrn,
      },
    };
  }

  const res = await matonFetch("/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const postId = res.headers.get("x-restli-id") || "";
  const data = await res.json().catch(() => ({}));

  return { ...data, id: postId, restliId: postId };
}

// ── Upload Image (3-step LinkedIn flow via Gateway) ──

export async function uploadImageToLinkedIn(
  imageBuffer: Buffer,
  contentType: string,
  author: string, // "urn:li:person:{id}" or "urn:li:organization:{id}"
): Promise<{ urn: string }> {
  if (isV1()) {
    // Old v1: direct upload
    const res = await fetch(`${MATON_V1_BASE}/linkedin/images`, {
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
      throw new Error(`Maton image upload error ${res.status}: ${body}`);
    }
    return res.json();
  }

  // Gateway: 3-step image upload
  // Step 1: Initialize upload
  const initRes = await matonFetch("/images?action=initializeUpload", {
    method: "POST",
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: author,
        fileSizeBytes: imageBuffer.length,
      },
    }),
  });
  const initData = await initRes.json();
  const uploadUrl: string = initData.value?.uploadUrl;
  const imageUrn: string = initData.value?.image;

  if (!uploadUrl || !imageUrn) {
    throw new Error("Maton: failed to initialize image upload");
  }

  // Step 2: PUT image binary directly to LinkedIn upload URL
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: imageBuffer as unknown as BodyInit,
  });
  if (!uploadRes.ok) {
    throw new Error(`LinkedIn image upload failed: ${uploadRes.status}`);
  }

  return { urn: imageUrn };
}

// ── Upload Document (PDF carousel) ──

export async function uploadDocumentToLinkedIn(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  author: string,
): Promise<{ urn: string }> {
  if (isV1()) {
    const res = await fetch(`${MATON_V1_BASE}/linkedin/documents`, {
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
      throw new Error(`Maton document upload error ${res.status}: ${body}`);
    }
    return res.json();
  }

  // Gateway: Initialize document upload
  const initRes = await matonFetch("/documents?action=initializeUpload", {
    method: "POST",
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: author,
        fileSizeBytes: fileBuffer.length,
      },
    }),
  });
  const initData = await initRes.json();
  const uploadUrl: string = initData.value?.uploadUrl;
  const docUrn: string = initData.value?.document;

  if (!uploadUrl || !docUrn) {
    throw new Error("Maton: failed to initialize document upload");
  }

  // Upload binary
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: fileBuffer as unknown as BodyInit,
  });
  if (!uploadRes.ok) {
    throw new Error(`LinkedIn document upload failed: ${uploadRes.status}`);
  }

  return { urn: docUrn };
}

export async function uploadMultipleImagesToLinkedIn(
  images: { buffer: Buffer; contentType: string }[],
  author: string,
) {
  return Promise.all(
    images.map((img) => uploadImageToLinkedIn(img.buffer, img.contentType, author)),
  );
}
