"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Settings, AlertTriangle } from "lucide-react";
import type { Provider } from "@/lib/llm-providers";

type LLMStatus = {
  configured: boolean;
  provider: Provider | null;
  model: string | null;
};

const STORAGE_KEY = "mc_llm_config";

function readConfigSnapshot() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

function subscribeToConfigChange(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", onStoreChange);
  window.addEventListener("mc_llm_config_changed", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("mc_llm_config_changed", onStoreChange);
  };
}

function parseStatus(raw: string): LLMStatus {
  if (!raw) return { configured: false, provider: null, model: null };

  try {
    const config = JSON.parse(raw) as { provider?: Provider; apiKey?: string; model?: string };
    const provider = config.provider ?? "ollama";
    const configured = provider === "ollama" || Boolean(config.apiKey);

    return {
      configured,
      provider,
      model: config.model ?? null,
    };
  } catch {
    return { configured: false, provider: null, model: null };
  }
}

export function useLLMStatus(): LLMStatus {
  const raw = useSyncExternalStore(subscribeToConfigChange, readConfigSnapshot, () => "");
  return parseStatus(raw);
}

export function LLMSetupBanner() {
  const [dismissed, setDismissed] = useState(false);
  const status = useLLMStatus();

  if (status.configured || dismissed) return null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-muted)] animate-fade-in">
      <AlertTriangle className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-[var(--color-warning)] font-medium">
          Aucun provider IA configuré
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Va dans les Paramètres pour configurer DeepSeek, OpenAI, Anthropic ou Ollama. Sans ça, la génération et le scoring ne fonctionneront pas.
        </p>
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] mt-2 transition-colors font-medium">
          <Settings className="h-3 w-3" /> Configurer un provider
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
