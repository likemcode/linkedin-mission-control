"use client";

import { useEffect, useState } from "react";
import { Settings, Key, Cpu, FlaskConical, CheckCircle, AlertTriangle, Eye, EyeOff, Link2, RefreshCw } from "lucide-react";
import { apiPath } from "@/lib/routes";
import {
  type Provider,
  type ProviderConfig,
  PROVIDER_MODELS,
  PROVIDER_LABELS,
  MODEL_EXAMPLES,
} from "@/lib/llm-providers";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { useToast } from "@/components/ui/toast";

const STORAGE_KEY = "mc_llm_config";

function loadConfig(): Partial<ProviderConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveConfig(config: Partial<ProviderConfig>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("mc_llm_config_changed"));
}

export default function SettingsPage() {
  const { toast } = useToast();

  const [provider, setProvider] = useState<Provider>("deepseek");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);

  // LinkedIn connection state
  const [linkedinStatus, setLinkedinStatus] = useState<{
    loading: boolean;
    matonConfigured: boolean;
    profile?: { firstName?: string; lastName?: string; headline?: string; authorUrn?: string; connected: boolean } | null;
    error?: string;
  }>({ loading: true, matonConfigured: false });

  async function checkLinkedInStatus() {
    setLinkedinStatus((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const res = await fetch(apiPath("/api/publish/status"));
      const data = await res.json();
      setLinkedinStatus({ loading: false, matonConfigured: data.matonConfigured, profile: data.profile });
    } catch {
      setLinkedinStatus((s) => ({ ...s, loading: false, error: "Impossible de vérifier le statut LinkedIn" }));
    }
  }

  useEffect(() => {
    checkLinkedInStatus();
  }, []);
    const saved = loadConfig();
    if (saved.provider) setProvider(saved.provider);
    if (saved.apiKey) setApiKey(saved.apiKey);
    if (saved.model) setModel(saved.model);
    if (saved.baseUrl) setBaseUrl(saved.baseUrl);
  }, []);

  useEffect(() => {
    // Auto-select default model when provider changes
    if (!model || !PROVIDER_MODELS[provider]?.some((m) => m.value === model)) {
      setModel(PROVIDER_MODELS[provider]?.[0]?.value || "");
    }
    setTestResult(null);
  }, [provider, model]);

  function handleSave() {
    const config: Partial<ProviderConfig> = { provider, model };
    if (apiKey) config.apiKey = apiKey;
    if (baseUrl) config.baseUrl = baseUrl;
    saveConfig(config);
    toast("success", "Configuration sauvegardée");
  }

  async function handleTest() {
    if (!apiKey && provider !== "ollama") {
      return toast("warning", "Entre ta clé API d'abord");
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/linkedin/api/llm-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKey || undefined,
          model,
          baseUrl: baseUrl || undefined,
        }),
      });

      const data = await res.json();
      if (data.content) {
        setTestResult("ok");
        toast("success", `Connexion réussie — ${provider}`);
      } else {
        setTestResult("fail");
        toast("error", data.error || "Échec du test");
      }
    } catch (err) {
      setTestResult("fail");
      toast("error", err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-[var(--color-accent)]" />
          Paramètres
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Connecte LinkedIn et configure ton provider IA.
        </p>
      </div>

      {/* ── LinkedIn Connection ── */}
      <div className="animate-fade-in-up stagger-1">
        <GlassCard padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-[var(--color-accent)]" />
              <h2 className="font-semibold text-lg">Connexion LinkedIn</h2>
            </div>
            <button
              onClick={checkLinkedInStatus}
              disabled={linkedinStatus.loading}
              className="btn btn-ghost btn-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${linkedinStatus.loading ? "animate-spin" : ""}`} />
              Actualiser
            </button>
          </div>

          {linkedinStatus.loading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="animate-spin h-4 w-4 rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
              <span className="text-sm text-[var(--color-text-secondary)]">Vérification de la connexion LinkedIn...</span>
            </div>
          ) : !linkedinStatus.matonConfigured ? (
            <div className="bg-[var(--color-warning-muted)] border border-[var(--color-warning)]/20 rounded-xl p-4">
              <p className="text-sm text-[var(--color-warning)] font-medium mb-1">Maton non configuré</p>
              <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                Pour publier sur LinkedIn, configure la clé API Maton dans le fichier <code className="bg-[var(--color-surface-2)] px-1 rounded text-[var(--color-text-primary)]">.env</code> du serveur.
              </p>
              <pre className="text-xs bg-[var(--color-surface-2)] text-[var(--color-text-muted)] p-2 rounded-lg overflow-x-auto">
                MATON_API_KEY=ta_clé{'\n'}MATON_CONNECTION_ID=ton_connection_id{'\n'}LINKEDIN_AUTHOR_URN=urn:li:person:xxx
              </pre>
            </div>
          ) : linkedinStatus.profile?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[var(--color-success-muted)] border border-[var(--color-success)]/20 rounded-xl">
                <CheckCircle className="h-5 w-5 text-[var(--color-success)] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-success)]">Connecté à LinkedIn</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Publication activée via Maton Gateway</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-[var(--color-surface-2)] rounded-xl">
                {linkedinStatus.profile.firstName ? (
                  <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {linkedinStatus.profile.firstName[0]}
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {linkedinStatus.profile.firstName} {linkedinStatus.profile.lastName}
                  </p>
                  {linkedinStatus.profile.headline && (
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">{linkedinStatus.profile.headline}</p>
                  )}
                  {linkedinStatus.profile.authorUrn && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
                      {linkedinStatus.profile.authorUrn}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                L&apos;author URN est utilisé pour publier sur ton profil LinkedIn. Il est découvert automatiquement via l&apos;API Maton.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--color-error-muted)] border border-[var(--color-error)]/20 rounded-xl p-4">
              <p className="text-sm text-[var(--color-error)] font-medium mb-1">Non connecté</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {linkedinStatus.error || "La clé Maton est configurée mais le profil LinkedIn n'a pas pu être récupéré. Vérifie que ta connexion Maton est active sur ctrl.maton.ai."}
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── LLM Provider ── */}
      <div className="animate-fade-in-up stagger-2">
        <GlassCard padding="lg">
          <div className="space-y-5">
            {/* Provider selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(PROVIDER_LABELS) as [Provider, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setProvider(key)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all ${
                      provider === key
                        ? "border-[var(--color-accent-border)] bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)]"
                        : "border-[var(--color-border-default)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
                    }`}
                  >
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {key === "ollama" ? "Local" : key === "deepseek" ? "OpenAI API" : key === "openai" ? "OpenAI API" : "Anthropic API"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            {provider !== "ollama" && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                  <Key className="h-4 w-4" /> Clé API
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setTestResult(null); }}
                    placeholder={provider === "anthropic" ? "sk-ant-api03-..." : "sk-..."}
                    className="input-base w-full pr-10"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                  Ta clé est stockée dans le localStorage de ton navigateur. Elle n&apos;est jamais sauvegardée sur le serveur.
                </p>
              </div>
            )}

            {/* Model selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Modèle
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="input-base w-full"
              >
                {PROVIDER_MODELS[provider].map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                Tu peux aussi taper un nom de modèle personnalisé dans la barre ci-dessous.
              </p>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={MODEL_EXAMPLES[provider]}
                className="input-base w-full mt-2 text-sm"
              />
            </div>

            {/* Base URL (advanced) */}
            <details className="text-sm">
              <summary className="text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-secondary)] transition-colors">
                Paramètres avancés
              </summary>
              <div className="mt-3">
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Base URL personnalisée
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={`https://api.${provider}.com...`}
                  className="input-base w-full text-sm"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                  Pour les proxies ou endpoints compatibles (ex: OpenRouter, Groq, serveur Ollama distant).
                </p>
              </div>
            </details>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <GradientButton
                onClick={handleTest}
                disabled={testing}
                loading={testing}
                variant="secondary"
                size="md"
              >
                <FlaskConical className="h-4 w-4" /> Tester la connexion
              </GradientButton>
              <GradientButton onClick={handleSave} variant="primary" size="md">
                Sauvegarder
              </GradientButton>
            </div>

            {/* Test result */}
            {testResult && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-xl ${
                testResult === "ok"
                  ? "bg-[var(--color-success-muted)] text-[var(--color-success)]"
                  : "bg-[var(--color-error-muted)] text-[var(--color-error)]"
              }`}>
                {testResult === "ok" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {testResult === "ok" ? "Connexion réussie — tout fonctionne !" : "Échec de la connexion. Vérifie ta clé API et le modèle."}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
