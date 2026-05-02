/**
 * Unified LLM provider abstraction.
 * Supports: deepseek, openai, anthropic, ollama.
 */

export type Provider = "deepseek" | "openai" | "anthropic" | "ollama";

export type ProviderConfig = {
  provider: Provider;
  apiKey?: string;
  model: string;
  baseUrl?: string; // optional override
};

type ContentResult = {
  content: string;
};

// ── OpenAI-compatible (DeepSeek & OpenAI share this) ──

const OPENAI_COMPAT_MODELS: Record<string, string> = {
  deepseek: "deepseek-v4-pro",
  openai: "gpt-4o",
};

const OPENAI_COMPAT_BASE: Record<string, string> = {
  deepseek: "https://api.deepseek.com/v1",
  openai: "https://api.openai.com/v1",
};

async function callOpenAICompatible(
  prompt: string,
  config: ProviderConfig,
): Promise<ContentResult> {
  const model = config.model || OPENAI_COMPAT_MODELS[config.provider] || "gpt-4o";
  const baseUrl = config.baseUrl || OPENAI_COMPAT_BASE[config.provider] || "https://api.openai.com/v1";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "Tu es un expert en copywriting LinkedIn." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      stream: false,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${config.provider} API error ${res.status}: ${body}`);
  }

  const data = await res.json() as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };

  if (data.error) throw new Error(data.error.message || "Unknown error");
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error(`${config.provider} returned an empty response`);

  return { content };
}

// ── Anthropic ──

const ANTHROPIC_MODELS: Record<string, string> = {
  default: "claude-sonnet-4-6",
};

async function callAnthropic(
  prompt: string,
  config: ProviderConfig,
): Promise<ContentResult> {
  const model = config.model || ANTHROPIC_MODELS.default;

  // Anthropic system prompt is a top-level param, not a message
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: "Tu es un expert en copywriting LinkedIn. Réponds uniquement avec le contenu demandé, sans commentaire ni explication.",
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json() as {
    content?: { type: string; text: string }[];
    error?: { message?: string };
  };

  if (data.error) throw new Error(data.error.message || "Unknown error");
  const text = data.content
    ?.filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("Anthropic returned an empty response");

  return { content: text };
}

// ── Ollama ──

async function callOllama(
  prompt: string,
  config: ProviderConfig,
): Promise<ContentResult> {
  const baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const model = config.model || process.env.OLLAMA_MODEL || "qwen3:8b";
  const apiKey = config.apiKey || process.env.OLLAMA_API_KEY;
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS) || 120_000;

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({ model, prompt, stream: false }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama error ${res.status}: ${body}`);
  }

  const data = await res.json() as { response?: string; error?: string };
  if (data.error) throw new Error(data.error);
  const content = data.response?.trim();
  if (!content) throw new Error("Ollama returned an empty response");

  return { content };
}

// ── Unified interface ──

export async function generateViaProvider(
  prompt: string,
  config: ProviderConfig,
): Promise<ContentResult> {
  switch (config.provider) {
    case "deepseek":
    case "openai":
      return callOpenAICompatible(prompt, config);
    case "anthropic":
      return callAnthropic(prompt, config);
    case "ollama":
      return callOllama(prompt, config);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

// ── Model suggestions ──

export const PROVIDER_MODELS: Record<Provider, { label: string; value: string }[]> = {
  deepseek: [
    { label: "DeepSeek V4 Pro", value: "deepseek-v4-pro" },
    { label: "DeepSeek V4 Flash", value: "deepseek-v4-flash" },
  ],
  openai: [
    { label: "GPT-4o", value: "gpt-4o" },
    { label: "GPT-4o Mini", value: "gpt-4o-mini" },
    { label: "O3 Mini", value: "o3-mini" },
  ],
  anthropic: [
    { label: "Claude Opus 4.7", value: "claude-opus-4-7" },
    { label: "Claude Sonnet 4.6", value: "claude-sonnet-4-6" },
    { label: "Claude Haiku 4.5", value: "claude-haiku-4-5-20251001" },
  ],
  ollama: [
    { label: "qwen3:8b", value: "qwen3:8b" },
    { label: "llama3.2", value: "llama3.2" },
    { label: "mistral", value: "mistral" },
    { label: "gemma3", value: "gemma3" },
  ],
};

export const PROVIDER_LABELS: Record<Provider, string> = {
  deepseek: "DeepSeek",
  openai: "OpenAI",
  anthropic: "Anthropic",
  ollama: "Ollama (local)",
};

export const MODEL_EXAMPLES: Record<Provider, string> = {
  deepseek: "deepseek-v4-pro",
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-6",
  ollama: process.env.OLLAMA_MODEL || "qwen3:8b",
};
