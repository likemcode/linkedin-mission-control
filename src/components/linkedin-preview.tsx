"use client";

import { useState, useMemo } from "react";

type Profile = {
  firstName?: string;
  lastName?: string;
  headline?: string;
  profilePicture?: string;
};

type Props = {
  content: string;
  profile: Profile | null;
  imageUrl?: string;
  imageUrls?: string[];
  documentUrl?: string;
  documentName?: string;
};

/* ── Image grid matching LinkedIn multi-image layout ── */
function ImageGrid({ images }: { images: string[] }) {
  const n = images.length;
  if (n === 0) return null;
  if (n === 1) return (
    <div className="mt-2 rounded-lg overflow-hidden border border-[#e0e0e0]">
      <img src={images[0]} alt="" className="w-full object-cover" style={{ maxHeight: 360 }} />
    </div>
  );
  if (n === 2) return (
    <div className="mt-2 grid grid-cols-2 gap-[3px] rounded-lg overflow-hidden border border-[#e0e0e0]">
      {images.map((u, i) => <img key={i} src={u} alt="" className="w-full object-cover aspect-[4/3]" />)}
    </div>
  );
  if (n === 3) return (
    <div className="mt-2 grid grid-cols-2 gap-[3px] rounded-lg overflow-hidden border border-[#e0e0e0]">
      <img src={images[0]} alt="" className="w-full object-cover aspect-[4/3]" />
      <div className="grid grid-rows-2 gap-[3px]">
        <img src={images[1]} alt="" className="w-full object-cover" />
        <img src={images[2]} alt="" className="w-full object-cover" />
      </div>
    </div>
  );
  return (
    <div className="mt-2 grid grid-cols-2 gap-[3px] rounded-lg overflow-hidden border border-[#e0e0e0]">
      {images.slice(0, 4).map((u, i) => (
        <div key={i} className="relative">
          <img src={u} alt="" className="w-full object-cover aspect-[4/3]" />
          {i === 3 && n > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xl font-semibold">+{n - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TruncatedContent({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const CHAR_CUTOFF = 210;
  const shouldTruncate = content.length > CHAR_CUTOFF;
  const displayText = expanded || !shouldTruncate ? content : content.slice(0, CHAR_CUTOFF);

  return (
    <>
      <span className="whitespace-pre-wrap break-words">{displayText || <span className="text-gray-400 italic">Ton post apparaîtra ici...</span>}</span>
      {shouldTruncate && !expanded && (
        <>
          {" "}<button onClick={() => setExpanded(true)} className="text-gray-500 hover:text-gray-700 hover:underline font-medium text-[15px]">…voir plus</button>
        </>
      )}
      {expanded && shouldTruncate && (
        <button onClick={() => setExpanded(false)} className="block mt-1 text-sm text-gray-500 hover:text-gray-700 hover:underline">voir moins</button>
      )}
    </>
  );
}

export function LinkedInPreview({ content, profile, imageUrl, imageUrls, documentUrl, documentName }: Props) {
  const allImages = imageUrls ?? (imageUrl ? [imageUrl] : []);
  const previewLikes = useMemo(() => (content.length % 12) + 1, [content.length]);
  const previewComments = useMemo(() => content.length % 4, [content.length]);
  const previewReposts = useMemo(() => content.length % 3, [content.length]);

  return (
    <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm text-[#191919] font-sans overflow-hidden" style={{ maxWidth: 552 }}>
      {/* ── Header: Avatar + Name + Headline + Time ── */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        {/* 48px avatar */}
        {profile?.profilePicture ? (
          <img src={profile.profilePicture} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#e0e0e0]" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#0a66c2] shrink-0 flex items-center justify-center text-white font-bold text-lg">
            {profile?.firstName?.[0] || "J"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm leading-tight hover:text-[#0a66c2] hover:underline cursor-pointer">
              {profile?.firstName || "Jean"} {profile?.lastName || "Dupont"}
            </span>
          </div>
          <p className="text-xs text-[#666] leading-tight mt-0.5 line-clamp-1">
            {profile?.headline || "Product Builder & Developer"}
          </p>
          <div className="flex items-center gap-1 text-xs text-[#666] mt-0.5">
            <span>Maintenant</span>
            <span className="select-none">·</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#666" className="shrink-0">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-3">
        <p data-testid="linkedin-preview-content" className="text-[15px] leading-relaxed text-[#191919]">
          <TruncatedContent content={content} />
        </p>

        {/* Document */}
        {documentUrl && (
          <div className="mt-2 rounded-lg border border-[#e0e0e0] p-3 flex items-center gap-3 bg-[#f9fafb]">
            <div className="w-10 h-10 rounded bg-[#0a66c2]/10 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0a66c2"><path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Document · {documentName || "document.pdf"}</p>
              <p className="text-xs text-gray-500">Carrousel</p>
            </div>
          </div>
        )}

        {/* Images */}
        <ImageGrid images={allImages} />
      </div>

      {/* ── Stats row ── */}
      {content.length > 0 && (
        <div className="px-4 pb-1 flex items-center gap-4 text-xs text-[#666]">
          <span>👍 {previewLikes}</span>
          <span>💬 {previewComments} commentaires</span>
          <span>🔄 {previewReposts} reposts</span>
        </div>
      )}

      {/* ── Action bar ── */}
      <div className="mx-3 border-t border-[#e0e0e0]" />
      <div className="grid grid-cols-4 px-2 py-1.5 text-xs font-semibold text-[#666] sm:text-sm">
        <button aria-label="J'aime" className="flex min-w-0 items-center justify-center gap-1 rounded-md px-1.5 py-2 transition-colors hover:bg-[#f3f3f3] sm:gap-1.5 sm:px-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 8.5h-2.7l-1.3-3.7c-.2-.6-.8-1-1.5-1h-3c-.7 0-1.3.4-1.5 1L8.2 8.5H5.5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-10c0-1.1-.9-2-2-2zm-7.5-3h1l1 3h-3l1-3zm8 15h-14v-10h14v10z"/></svg>
          <span className="hidden sm:inline">J&apos;aime</span>
        </button>
        <button aria-label="Commenter" className="flex min-w-0 items-center justify-center gap-1 rounded-md px-1.5 py-2 transition-colors hover:bg-[#f3f3f3] sm:gap-1.5 sm:px-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3v18h18V3zm-2 16H5V5h14v14z"/><path d="M7 7h10v2H7zm0 4h7v2H7z"/></svg>
          <span className="hidden sm:inline">Commenter</span>
        </button>
        <button aria-label="Republier" className="flex min-w-0 items-center justify-center gap-1 rounded-md px-1.5 py-2 transition-colors hover:bg-[#f3f3f3] sm:gap-1.5 sm:px-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 4.5h9v2h-9zm0 6h9v2h-9zm0 6h5v2h-5z"/><path d="M16.5 21V8l-6-6H4.5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2z"/></svg>
          <span className="hidden sm:inline">Republier</span>
        </button>
        <button aria-label="Envoyer" className="flex min-w-0 items-center justify-center gap-1 rounded-md px-1.5 py-2 transition-colors hover:bg-[#f3f3f3] sm:gap-1.5 sm:px-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
          <span className="hidden sm:inline">Envoyer</span>
        </button>
      </div>
    </div>
  );
}
