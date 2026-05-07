"use client";

import { useState } from "react";
import { Bold, Italic, Minus, List, Smile } from "lucide-react";
import { EmojiPicker } from "@/components/emoji-picker";

const BOLD_MAP: Record<string, string> = {
  a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺",
  n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠",
  N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
  "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵",
};

const ITALIC_MAP: Record<string, string> = {
  a: "𝘢", b: "𝘣", c: "𝘤", d: "𝘥", e: "𝘦", f: "𝘧", g: "𝘨", h: "𝘩", i: "𝘪", j: "𝘫", k: "𝘬", l: "𝘭", m: "𝘮",
  n: "𝘯", o: "𝘰", p: "𝘱", q: "𝘲", r: "𝘳", s: "𝘴", t: "𝘵", u: "𝘶", v: "𝘷", w: "𝘸", x: "𝘹", y: "𝘺", z: "𝘻",
  A: "𝘈", B: "𝘉", C: "𝘊", D: "𝘋", E: "𝘌", F: "𝘍", G: "𝘎", H: "𝘏", I: "𝘐", J: "𝘑", K: "𝘒", L: "𝘓", M: "𝘔",
  N: "𝘕", O: "𝘖", P: "𝘗", Q: "𝘘", R: "𝘙", S: "𝘚", T: "𝘛", U: "𝘜", V: "𝘝", W: "𝘞", X: "𝘟", Y: "𝘠", Z: "𝘡",
  "0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
};

function applyToSelection(text: string, selectionStart: number, selectionEnd: number, map: Record<string, string>): string {
  if (selectionStart === selectionEnd) return text;
  const selected = text.slice(selectionStart, selectionEnd);
  const transformed = selected.split("").map((c) => map[c] || c).join("");
  return text.slice(0, selectionStart) + transformed + text.slice(selectionEnd);
}

function wrapSelection(text: string, selectionStart: number, selectionEnd: number, wrap: string): string {
  const before = text.slice(0, selectionStart);
  const selected = text.slice(selectionStart, selectionEnd);
  const after = text.slice(selectionEnd);
  if (selected) return before + wrap + selected + wrap + after;
  return before + wrap + after;
}

type ToolbarProps = {
  content: string;
  setContent: (val: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
};

export function EditorToolbar({ content, setContent, textareaRef }: ToolbarProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);

  function apply(action: "bold" | "italic" | "separator" | "bullet") {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (action === "bold") {
      setContent(applyToSelection(content, start, end, BOLD_MAP));
    } else if (action === "italic") {
      setContent(applyToSelection(content, start, end, ITALIC_MAP));
    } else if (action === "separator") {
      const sep = "\n━━━━━━━━━━━━━━━━━━━━━━\n";
      setContent(content.slice(0, start) + sep + content.slice(end));
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + sep.length;
        ta.focus();
      }, 0);
    } else if (action === "bullet") {
      setContent(content.slice(0, start) + "• " + content.slice(end));
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
        ta.focus();
      }, 0);
    }
  }

  function insertEmoji(emoji: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    setContent(content.slice(0, start) + emoji + content.slice(ta.selectionEnd || start));
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + emoji.length;
      ta.focus();
    }, 0);
  }

  return (
    <div className="flex items-center gap-1 px-2">
      <button onClick={() => apply("bold")} className="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--color-text-primary)] transition-colors" title="Gras (Unicode)">
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => apply("italic")} className="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--color-text-primary)] transition-colors" title="Italique (Unicode)">
        <Italic className="h-3.5 w-3.5" />
      </button>
      <div className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />
      <button onClick={() => apply("separator")} className="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--color-text-primary)] transition-colors" title="Séparateur">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => apply("bullet")} className="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--color-text-primary)] transition-colors" title="Puce">
        <List className="h-3.5 w-3.5" />
      </button>
      <div className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />
      <div className="relative">
        <button onClick={() => setEmojiOpen(!emojiOpen)} className="p-1.5 rounded-md text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--color-text-primary)] transition-colors" title="Emoji">
          <Smile className="h-3.5 w-3.5" />
        </button>
        {emojiOpen && <EmojiPicker onSelect={insertEmoji} onClose={() => setEmojiOpen(false)} />}
      </div>
    </div>
  );
}
