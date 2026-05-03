import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { publishToLinkedIn, uploadImageToLinkedIn } from "@/lib/maton";

function normalizeAuthorUrn(author?: string | null) {
  const trimmed = author?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("urn:li:person:") || trimmed.startsWith("urn:li:organization:")) {
    return trimmed;
  }
  return null;
}

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

async function resolveLinkedInImageUrn(imageUrls: string | null, author: string) {
  const firstImage = imageUrls?.split(",").map((url) => url.trim()).filter(Boolean)[0];
  if (!firstImage) return undefined;
  if (firstImage.startsWith("urn:li:image:")) return firstImage;

  if (firstImage.startsWith("/uploads/")) {
    const filename = path.basename(firstImage);
    const localPath = path.join(process.cwd(), "public", "uploads", filename);
    const buffer = await readFile(localPath);
    const uploaded = await uploadImageToLinkedIn(buffer, contentTypeFor(localPath), author);
    return uploaded.urn;
  }

  throw new Error("Image publishing only supports local uploads or LinkedIn image URNs for now.");
}

async function discoverAuthorUrn(): Promise<string | null> {
  // First check env
  const configuredAuthor = normalizeAuthorUrn(process.env.LINKEDIN_AUTHOR_URN);
  if (configuredAuthor) return configuredAuthor;

  // Auto-discover via profile
  try {
    const { getLinkedInProfile } = await import("@/lib/maton");
    const profile = await getLinkedInProfile();
    const personUrn = normalizeAuthorUrn(profile.authorUrn || profile.personUrn);
    if (personUrn) return personUrn;
    if (profile.id) return `urn:li:person:${profile.id}`;
  } catch { /* will throw below */ }
  return null;
}

export async function POST(request: NextRequest) {
  const { postId, authorUrn } = await request.json();

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  if (!process.env.MATON_API_KEY) {
    return Response.json(
      { error: "MATON_API_KEY missing — LinkedIn publishing not configured." },
      { status: 400 },
    );
  }

  try {
    const author = normalizeAuthorUrn(authorUrn) ?? await discoverAuthorUrn();
    if (!author) {
      return Response.json(
        { error: "LinkedIn profile not connected. Use the onboarding to verify your connection." },
        { status: 400 },
      );
    }

    await prisma.post.update({
      where: { id: postId },
      data: { status: "publishing" },
    });

    const mediaUrn = await resolveLinkedInImageUrn(post.imageUrls, author);
    const result = await publishToLinkedIn({
      author,
      commentary: post.content,
      visibility: "PUBLIC",
      mediaUrn,
    });

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { status: "published", publishedAt: new Date() },
    });

    return Response.json({ ...updated, linkedinId: result.restliId || result.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.post.update({
      where: { id: postId },
      data: { status: "failed" },
    }).catch(() => {});
    return Response.json({ error: message }, { status: 500 });
  }
}
