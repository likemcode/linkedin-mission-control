"use client";

const TOP_EMOJIS = ["🔥", "🚀", "💡", "🎯", "⚡", "🎬", "👇", "✅", "❌", "💪", "🧠", "✨"];

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 z-50 bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)] rounded-xl p-2 shadow-2xl animate-scale-in">
        <div className="grid grid-cols-6 gap-1">
          {TOP_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => { onSelect(emoji); onClose(); }}
              className="w-9 h-9 flex items-center justify-center text-lg hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
