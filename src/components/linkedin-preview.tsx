"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

type Profile = {
  firstName?: string;
  lastName?: string;
  headline?: string;
  profilePicture?: string;
};

type LinkedInPreviewProps = {
  content: string;
  profile: Profile | null;
  imageUrl?: string;
  imageUrls?: string[];
  documentUrl?: string;
  documentName?: string;
};

function ImageGrid({ images }: { images: string[] }) {
  const count = images.length;
  if (count === 1) {
    return (
      <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
        <img src={images[0]} alt="Post attachment" className="w-full object-cover max-h-96" />
      </div>
    );
  }
  if (count === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-0.5 rounded-lg overflow-hidden border border-gray-200">
        {images.map((url, i) => (
          <img key={i} src={url} alt={`Image ${i + 1}`} className="w-full object-cover aspect-square" />
        ))}
      </div>
    );
  }
  if (count === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-0.5 rounded-lg overflow-hidden border border-gray-200">
        <img src={images[0]} alt="Image 1" className="w-full object-cover aspect-square" />
        <div className="grid grid-rows-2 gap-0.5">
          <img src={images[1]} alt="Image 2" className="w-full object-cover h-full" />
          <img src={images[2]} alt="Image 3" className="w-full object-cover h-full" />
        </div>
      </div>
    );
  }
  // 4+ images: 2-column grid
  return (
    <div className="mt-3 grid grid-cols-2 gap-0.5 rounded-lg overflow-hidden border border-gray-200">
      {images.slice(0, 4).map((url, i) => (
        <div key={i} className="relative">
          <img src={url} alt={`Image ${i + 1}`} className="w-full object-cover aspect-square" />
          {i === 3 && images.length > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-lg font-bold">+{images.length - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function LinkedInPreview({ content, profile, imageUrl, imageUrls, documentUrl, documentName }: LinkedInPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  const lines = content.split("\n");
  const shouldTruncate = content.length > 280 || lines.length > 5;
  const displayContent = expanded || !shouldTruncate ? content : lines.slice(0, 5).join("\n");

  const allImages = imageUrls ?? (imageUrl ? [imageUrl] : []);

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden text-gray-900 animate-fade-in">
      {/* LinkedIn Header */}
      <div className="p-4 flex items-center gap-3">
        {profile?.profilePicture ? (
          <img src={profile.profilePicture} alt="Profile" className="w-12 h-12 rounded-full shadow-sm object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            {profile?.firstName ? profile.firstName[0] : "J"}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-sm leading-tight">
            {profile?.firstName} {profile?.lastName || ""}
          </div>
          <div className="text-xs text-gray-500 leading-tight mt-0.5 line-clamp-1 max-w-[280px]">
            {profile?.headline || "Product Builder & Developer"}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            Maintenant &middot; <span className="text-[10px]">🌍</span>
          </div>
        </div>
      </div>

      {/* LinkedIn Content */}
      <div className="px-4 pb-3">
        <div
          className="text-sm whitespace-pre-wrap leading-relaxed text-gray-900 font-sans"
          style={{ wordBreak: "break-word" }}
        >
          {displayContent || <span className="text-gray-400 italic">Ton post apparaîtra ici...</span>}
        </div>

        {/* "See more" toggle */}
        {shouldTruncate && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-1 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            …voir plus
          </button>
        )}
        {expanded && shouldTruncate && (
          <button
            onClick={() => setExpanded(false)}
            className="mt-1 text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            voir moins
          </button>
        )}

        {/* Document attachment */}
        {documentUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 p-4 bg-gray-50 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Document joint</p>
              <p className="text-xs text-gray-500">{documentName || "document.pdf"}</p>
            </div>
          </div>
        )}

        {/* Image previews */}
        {allImages.length > 0 && <ImageGrid images={allImages} />}
      </div>

      {/* LinkedIn Engagement Bar */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span>👍 {Math.floor(Math.random() * 15 + 1)}</span>
          <span>💬 {Math.floor(Math.random() * 5)}</span>
          <span>🔄 {Math.floor(Math.random() * 3)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-500 text-xs font-semibold border-t border-gray-100 pt-2">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer"><span className="text-lg">👍</span> Like</span>
            <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer"><span className="text-lg">💬</span> Comment</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer"><span className="text-lg">🔄</span> Repost</span>
            <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer"><span className="text-lg">✉️</span> Send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
