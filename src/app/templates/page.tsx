"use client";

import { useEffect, useState } from "react";

type Template = {
  id: string;
  name: string;
  description: string;
  structure: string;
  category: string;
};

const categoryColors: Record<string, string> = {
  storytelling: "bg-purple-900/50 text-purple-400",
  tips: "bg-blue-900/50 text-blue-400",
  "hot-take": "bg-red-900/50 text-red-400",
  transformation: "bg-green-900/50 text-green-400",
  lesson: "bg-yellow-900/50 text-yellow-400",
  carousel: "bg-cyan-900/50 text-cyan-400",
  bts: "bg-orange-900/50 text-orange-400",
  general: "bg-gray-800 text-gray-400",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then(setTemplates);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Templates</h1>
      <p className="text-gray-400 mb-6">
        Structures de posts réutilisables. Sélectionne un template dans l&apos;éditeur ou le mode batch.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {templates.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelected(selected?.id === t.id ? null : t)}
            className={`bg-gray-900 border rounded-lg p-4 cursor-pointer transition-colors ${
              selected?.id === t.id ? "border-blue-600" : "border-gray-800 hover:border-gray-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{t.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[t.category] ?? categoryColors.general}`}>
                {t.category}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">{t.description}</p>
            {selected?.id === t.id && (
              <pre className="text-xs text-gray-500 bg-gray-800 rounded p-3 mt-2 whitespace-pre-wrap">
                {t.structure}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
