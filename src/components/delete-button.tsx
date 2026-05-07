"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { apiPath } from "@/lib/routes";

export function DeleteButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    await fetch(apiPath(`/api/posts/${postId}`), { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-1 animate-scale-in">
        <button
          onClick={handleDelete}
          className="btn btn-danger btn-sm"
        >
          Oui
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="btn btn-secondary btn-sm"
        >
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-muted)] transition-all"
      title="Supprimer"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
