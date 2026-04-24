"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Sparkles, Target, ArrowRight, ArrowLeft, Link2 } from "lucide-react";
import { apiPath } from "@/lib/routes";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { ScoreRing } from "@/components/ui/score-ring";
import { useProfile } from "@/components/profile-provider";

const ONBOARDING_KEY = "mc_onboarding_complete";

type Step = {
  title: string;
  description: string;
  icon: typeof Sparkles;
};

const STEPS: Step[] = [
  {
    title: "Connecte LinkedIn",
    description: "Vérifions que ton compte LinkedIn est bien connecté via l'API Maton.",
    icon: Link2,
  },
  {
    title: "Génère ton premier post",
    description: "Choisis un template, entre un sujet, et l'IA écrit un post pour toi.",
    icon: Sparkles,
  },
  {
    title: "Découvre ton score",
    description: "L'IA analyse ton post et lui donne un score d'engagement sur 100.",
    icon: Target,
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [profileOk, setProfileOk] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Post generation state
  const [postTopic, setPostTopic] = useState("");
  const [generatedPost, setGeneratedPost] = useState("");
  const [generating, setGenerating] = useState(false);

  // Score state
  const [score, setScore] = useState<number | null>(null);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setVisible(true);
  }, []);

  function close() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  async function checkProfile() {
    setCheckingProfile(true);
    try {
      const res = await fetch(apiPath("/api/profile"));
      const data = await res.json();
      if (!data.error && (data.firstName || data.localizedFirstName)) {
        setProfileOk(true);
        setTimeout(() => setStep(1), 500);
      } else {
        setProfileOk(false);
      }
    } catch {
      setProfileOk(false);
    } finally {
      setCheckingProfile(false);
    }
  }

  async function generatePost() {
    if (!postTopic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch(apiPath("/api/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: postTopic }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedPost(data.content);
      // Auto-score
      const scoreRes = await fetch(apiPath("/api/score"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content }),
      });
      const scoreData = await scoreRes.json();
      if (!scoreData.error) setScore(scoreData.score);
    } catch {
      // Continue anyway
    } finally {
      setGenerating(false);
    }
  }

  function finish() {
    close();
    router.push("/editor");
  }

  const currentStep = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative z-10 w-full max-w-lg mx-4 animate-scale-in">
        <GlassCard padding="lg" className="border-[var(--color-accent-border)]">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step
                    ? "bg-[var(--color-success-muted)] text-[var(--color-success)]"
                    : i === step
                      ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] ring-2 ring-[var(--color-accent-border)]"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
                }`}>
                  {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                {i < 2 && <div className={`h-px flex-1 ${i < step ? "bg-[var(--color-success)]" : "bg-[var(--color-border-subtle)]"}`} />}
              </div>
            ))}
          </div>

          {/* Step Icon */}
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-[var(--color-accent-muted)] flex items-center justify-center">
              <currentStep.icon className="h-8 w-8 text-[var(--color-accent)]" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center mb-1">{currentStep.title}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] text-center mb-6">{currentStep.description}</p>

          {/* Step 1 Content: LinkedIn Connection Check */}
          {step === 0 && (
            <div className="space-y-4">
              {profileOk ? (
                <div className="text-center animate-fade-in">
                  <div className="flex items-center justify-center gap-2 text-[var(--color-success)] mb-2">
                    <CheckCircle className="h-5 w-5" /> Connected !
                  </div>
                  {profile && (
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {profile.firstName} {profile.lastName} — {profile.headline}
                    </p>
                  )}
                </div>
              ) : (
                <GradientButton
                  onClick={checkProfile}
                  loading={checkingProfile}
                  variant="primary"
                  className="w-full justify-center"
                  size="lg"
                >
                  <Link2 className="h-5 w-5" /> Vérifier la connexion
                </GradientButton>
              )}

              {profileOk && (
                <GradientButton onClick={() => setStep(1)} variant="primary" className="w-full justify-center" size="md">
                  Continuer <ArrowRight className="h-4 w-4" />
                </GradientButton>
              )}
            </div>
          )}

          {/* Step 2 Content: Generate First Post */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  De quoi veux-tu parler ?
                </label>
                <textarea
                  value={postTopic}
                  onChange={(e) => setPostTopic(e.target.value)}
                  placeholder="Ex: Les 3 leçons que j'ai apprises en devenant développeur..."
                  className="input-base w-full resize-none h-24 text-sm"
                />
              </div>

              {generatedPost && (
                <div className="animate-fade-in">
                  <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-4 text-sm whitespace-pre-wrap text-[var(--color-text-secondary)] max-h-48 overflow-y-auto border border-[var(--color-border-subtle)]">
                    {generatedPost}
                  </div>
                </div>
              )}

              <GradientButton
                onClick={generatePost}
                disabled={!postTopic.trim() || generating}
                loading={generating}
                variant="primary"
                className="w-full justify-center"
              >
                {generatedPost ? <Sparkles className="h-4 w-4" /> : null}
                {generating ? "Génération..." : generatedPost ? "Regénérer" : "Générer un post"}
              </GradientButton>

              <div className="flex gap-2">
                <GradientButton onClick={() => setStep(0)} variant="ghost" size="sm">
                  <ArrowLeft className="h-3.5 w-3.5" /> Retour
                </GradientButton>
                <GradientButton onClick={() => setStep(2)} variant="secondary" className="flex-1 justify-center" disabled={!generatedPost}>
                  Voir le score <ArrowRight className="h-3.5 w-3.5" />
                </GradientButton>
              </div>
            </div>
          )}

          {/* Step 3 Content: Score Discovery */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center animate-fade-in">
                {score !== null ? (
                  <>
                    <ScoreRing score={score} size={100} className="mx-auto mb-4" />
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                      Le score IA évalue le potentiel d&apos;engagement de ton post sur 100.
                      Il analyse le hook, la clarté, la structure et l&apos;appel à l&apos;action.
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-[var(--color-error-muted)] rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-[var(--color-error)]">0-40</div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">À retravailler</div>
                      </div>
                      <div className="bg-[var(--color-warning-muted)] rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-[var(--color-warning)]">40-70</div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">Correct</div>
                      </div>
                      <div className="bg-[var(--color-success-muted)] rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-[var(--color-success)]">70-100</div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">Excellent</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    Le scoring se fait automatiquement après la génération d&apos;un post.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <GradientButton onClick={() => setStep(1)} variant="ghost" size="sm">
                  <ArrowLeft className="h-3.5 w-3.5" /> Retour
                </GradientButton>
                <GradientButton onClick={finish} variant="primary" className="flex-1 justify-center">
                  Commencer <ArrowRight className="h-3.5 w-3.5" />
                </GradientButton>
              </div>

              <button onClick={close} className="w-full text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors py-1">
                Passer l&apos;introduction
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
