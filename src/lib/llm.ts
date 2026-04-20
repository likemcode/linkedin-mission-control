const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "qwen3:8b";
const DEFAULT_TIMEOUT_MS = 120_000;

type GenerateOptions = {
  model?: string;
  temperature?: number;
};

type OllamaGenerateResponse = {
  response?: string;
  error?: string;
};

function getBaseUrl() {
  return (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, "");
}

function getModel() {
  return process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
}

function getTimeoutMs() {
  const raw = Number(process.env.LLM_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
}

async function getErrorMessage(response: Response) {
  const text = await response.text();

  if (!text) {
    return `${response.status} ${response.statusText}`;
  }

  try {
    const data = JSON.parse(text) as { error?: string; message?: string };
    return data.error || data.message || text;
  } catch {
    return text;
  }
}

/**
 * Generate text through Ollama.
 *
 * This works with:
 * - a local Ollama daemon,
 * - a local daemon signed into Ollama cloud for cloud-enabled models,
 * - or a remote Ollama-compatible endpoint via OLLAMA_BASE_URL.
 */
export async function generateContent(prompt: string, options: GenerateOptions = {}) {
  const baseUrl = getBaseUrl();
  const model = options.model || getModel();
  const timeoutMs = getTimeoutMs();
  const apiKey = process.env.OLLAMA_API_KEY;

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      ...(options.temperature !== undefined
        ? { options: { temperature: options.temperature } }
        : {}),
    }),
    signal: AbortSignal.timeout(timeoutMs),
  }).catch((error: unknown) => {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(`LLM request timed out after ${timeoutMs}ms`);
    }

    if (error instanceof Error) {
      throw new Error(`Could not reach Ollama at ${baseUrl}: ${error.message}`);
    }

    throw error;
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${await getErrorMessage(response)}`);
  }

  const data = (await response.json()) as OllamaGenerateResponse;
  const content = data.response?.trim();

  if (!content) {
    throw new Error(data.error || "Ollama returned an empty response");
  }

  return content;
}
