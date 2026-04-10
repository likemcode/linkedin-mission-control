import { prisma } from "./db";

const defaultTemplates = [
  {
    name: "Storytelling",
    description: "Raconte une histoire personnelle avec une leçon",
    category: "storytelling",
    structure: `Structure du post:
1. Hook accrocheur (1 ligne qui arrête le scroll)
2. Contexte de l'histoire (2-3 lignes)
3. Le problème/défi rencontré
4. La résolution/ce que tu as fait
5. La leçon apprise (takeaway)
6. Question ouverte pour engager

Ton: authentique, vulnérable, inspirant`,
  },
  {
    name: "Liste de tips",
    description: "X conseils/astuces sur un sujet",
    category: "tips",
    structure: `Structure du post:
1. Hook: "X [conseils/erreurs/leçons] que j'aurais aimé connaître sur [sujet]"
2. Liste numérotée avec un tip par ligne
3. Chaque tip = une phrase percutante
4. Conclusion avec un CTA

Ton: direct, actionnable, expertise`,
  },
  {
    name: "Hot Take",
    description: "Opinion forte et controversée sur un sujet",
    category: "hot-take",
    structure: `Structure du post:
1. Affirmation forte et contraire au consensus (1 ligne)
2. "Voici pourquoi:" ou "Laissez-moi expliquer:"
3. 3-4 arguments courts et percutants
4. Nuance finale
5. "D'accord ou pas d'accord?" ou question polarisante

Ton: confiant, provocateur mais respectueux`,
  },
  {
    name: "Avant/Après",
    description: "Transformation ou évolution sur un sujet",
    category: "transformation",
    structure: `Structure du post:
1. Hook: situation de départ (le "avant" en 1 ligne)
2. Les problèmes de cette situation
3. Le déclic / ce qui a changé
4. Le "après" — résultats concrets
5. Comment le lecteur peut faire pareil
6. CTA

Ton: motivant, concret, preuve par l'exemple`,
  },
  {
    name: "Leçon du jour",
    description: "Une leçon tirée d'une expérience récente",
    category: "lesson",
    structure: `Structure du post:
1. "Aujourd'hui j'ai appris quelque chose:" ou hook similaire
2. Le contexte (court)
3. Ce qui s'est passé
4. La leçon tirée (en gras ou caps)
5. Comment l'appliquer
6. Question au lecteur

Ton: humble, réflexif, partageur`,
  },
  {
    name: "Carrousel texte",
    description: "Post long format avec sections claires",
    category: "carousel",
    structure: `Structure du post:
1. Titre accrocheur
2. 5-7 sections séparées par des lignes vides
3. Chaque section = un point clé avec emoji en début
4. Chaque point fait 2-3 lignes max
5. Conclusion et CTA final

Ton: éducatif, structuré, scannable`,
  },
  {
    name: "Behind the scenes",
    description: "Montre les coulisses de ton travail",
    category: "bts",
    structure: `Structure du post:
1. "Ce que vous voyez:" (le résultat)
2. "Ce que vous ne voyez pas:" (les coulisses)
3. Liste des défis/échecs/itérations
4. Ce que ça t'a appris
5. Message d'encouragement

Ton: transparent, réaliste, motivant`,
  },
];

export async function seedTemplates() {
  const count = await prisma.template.count();
  if (count > 0) return;

  for (const t of defaultTemplates) {
    await prisma.template.create({ data: t });
  }
}
