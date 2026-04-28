# Spécification UX — Éditeur LinkedIn Mission Control

Date: 2026-04-28
Scope: écran `Nouveau post` / `Editor`, bloc Assistant IA, score, sauvegarde et feedback utilisateur.

## 1. Problème actuel

L'éditeur fonctionne techniquement, mais manque de feedback explicite pendant les actions longues. L'utilisateur voit des boutons grisés ou un label minimal (`...`, `Analyse...`) sans comprendre clairement :

- pourquoi une action est indisponible ;
- si une génération est réellement lancée ;
- combien de temps approximatif attendre ;
- quoi faire ensuite ;
- si une erreur vient du prompt, du réseau, du LLM ou de la publication.

Résultat: l'interface donne une impression de bug alors que le système attend simplement une entrée ou travaille en arrière-plan.

## 2. Objectifs UX

1. Rendre chaque état compréhensible sans explication externe.
2. Donner un feedback immédiat après chaque clic important.
3. Réduire l'anxiété pendant les actions IA longues.
4. Guider l'utilisateur vers le prochain meilleur geste.
5. Préserver le contenu utilisateur en cas d'erreur.
6. Préparer l'app pour des workflows plus avancés: variantes, brouillons, score, amélioration, publication.

## 3. Principes de design

- **Action visible**: après un clic, l'interface doit changer dans les 100–300 ms.
- **État nommé**: ne jamais afficher seulement `...`; préférer `Génération en cours...`.
- **Disabled expliqué**: tout bouton désactivé doit être accompagné d'une raison proche du bouton.
- **Non-destructif**: améliorer/générer ne doit pas faire perdre un texte existant sans avertir.
- **Progressif**: commencer simple, puis montrer les options avancées quand elles deviennent pertinentes.
- **Ton humain**: phrases courtes, utiles, pas de jargon technique.

## 4. Parcours cible — génération d'un nouveau post

### État initial

- Zone `Contenu du post` vide.
- Champ IA avec placeholder clair: `Ex: raconte mon parcours AWS + Data Engineering en post LinkedIn`.
- Bouton principal: `Générer un post`.
- Bouton `Scorer ce post` désactivé.
- Message d'aide sous le champ IA:
  - Si prompt vide: `Décris le sujet du post pour lancer la génération.`
  - Si prompt rempli: `Prêt à générer.`

### Au clic sur Générer

- Bouton passe en loading: spinner + `Génération en cours...`.
- Champ prompt et template restent visibles mais désactivés pendant la requête.
- Afficher un panneau de statut:
  - `Friend prépare ton post LinkedIn...`
  - `Ça peut prendre quelques secondes selon le modèle IA.`
- Empêcher les doubles clics.

### Succès

- Remplir la zone de contenu.
- Afficher toast/banner success: `Post généré. Relis, ajuste puis score-le.`
- Activer `Scorer ce post`, `Brouillon`, `Publier`.
- Le bouton principal devient `Améliorer` parce qu'un contenu existe.

### Erreur

- Garder prompt + contenu existant.
- Afficher erreur inline dans le bloc IA, pas `alert()` navigateur.
- Message actionnable:
  - `La génération a échoué. Vérifie le modèle IA ou réessaie.`
  - Bouton secondaire: `Réessayer`.

## 5. Parcours cible — amélioration d'un post existant

### État avec contenu

- Bouton principal: `Améliorer`.
- Champ IA placeholder: `Ex: rends-le plus storytelling, plus court, plus professionnel...`.
- Message d'aide:
  - Si instruction vide: `Ajoute une instruction ou clique Améliorer pour une amélioration générale.`

### Au clic sur Améliorer

- Loading: `Amélioration en cours...`.
- Afficher statut: `Friend retravaille le post sans toucher à ton brouillon original.`

### Comportement recommandé

V1 simple:
- Remplacer le contenu par la version améliorée.
- Afficher bouton `Annuler l'amélioration` pendant la session, basé sur une copie locale `previousContent`.

V2 plus avancée:
- Afficher la version améliorée comme proposition dans un panneau:
  - `Remplacer le post`
  - `Copier dans le post`
  - `Garder l'original`

## 6. Parcours cible — scoring

### État sans contenu

- Bouton `Scorer ce post` désactivé.
- Texte d'aide proche: `Écris ou génère un post avant de demander un score.`

### Au clic sur Scorer

- Loading: spinner + `Analyse du post...`.
- Panneau statut:
  - `Analyse du hook, de la clarté, de la structure et du potentiel d'engagement...`

### Succès

Afficher une carte score plus actionnable:

- Score global `/100`.
- Feedback court.
- Sections recommandées:
  - `Hook`
  - `Clarté`
  - `Structure`
  - `CTA`
  - `Hashtags`
- Hashtags cliquables à ajouter.
- CTA: `Améliorer avec ce feedback`.

## 7. États UI à implémenter

Créer un état de statut central pour l'assistant IA:

```ts
type AiStatus =
  | { type: "idle" }
  | { type: "info"; message: string }
  | { type: "loading"; title: string; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };
```

États requis:

- `idle`: rien à afficher ou aide légère.
- `loading/generate`: génération en cours.
- `loading/improve`: amélioration en cours.
- `loading/score`: analyse en cours.
- `success`: action réussie.
- `error`: erreur inline.

## 8. Microcopy proposée

### Génération

- Bouton idle: `Générer un post`
- Bouton loading: `Génération en cours...`
- Statut: `Friend prépare ton post LinkedIn.`
- Aide: `Décris le sujet du post pour lancer la génération.`
- Succès: `Post généré. Relis, ajuste puis score-le.`

### Amélioration

- Bouton idle: `Améliorer`
- Bouton loading: `Amélioration en cours...`
- Statut: `Friend retravaille ton post.`
- Succès: `Post amélioré. Tu peux annuler si tu préfères l'ancienne version.`
- Undo: `Annuler l'amélioration`

### Score

- Bouton idle: `Scorer ce post`
- Bouton loading: `Analyse en cours...`
- Statut: `Analyse du hook, de la clarté et du potentiel d'engagement.`
- Empty state: `Écris ou génère un post avant de demander un score.`

## 9. Priorisation développement

### Phase 1 — Quick UX win

- Remplacer `...` par labels loading explicites.
- Ajouter panneau de statut IA inline.
- Ajouter messages d'aide pour boutons désactivés.
- Remplacer `alert()` par erreurs inline.
- Ajouter `previousContent` + bouton undo après amélioration.

### Phase 2 — Scoring actionnable

- Améliorer la carte de score.
- Ajouter `Améliorer avec ce feedback`.
- Afficher catégories UX du post.

### Phase 3 — Expérience avancée

- Proposition d'amélioration non destructive avant remplacement.
- Historique de versions local/session.
- Variantes de posts: storytelling, expert, court, provocateur.
- Progress steps si génération longue.

## 10. Critères d'acceptation Phase 1

- Quand l'utilisateur clique `Générer`, un message visible indique que le post est en cours de génération.
- Quand l'utilisateur clique `Améliorer`, un message visible indique que le post est en cours d'amélioration.
- Aucun bouton IA n'affiche seulement `...`.
- Si `Générer` est désactivé, l'utilisateur comprend pourquoi.
- Si `Scorer ce post` est désactivé, l'utilisateur comprend pourquoi.
- Les erreurs IA sont affichées dans l'interface, pas via `alert()`.
- Après amélioration, l'utilisateur peut annuler et restaurer le texte précédent.
- `npm run lint` et `npm run build` passent.

## 11. Spécification détaillée Phase 1 — implémentation validée

### 11.1 Composant cible

Fichier principal: `src/components/post-editor.tsx`.

La Phase 1 ne change pas le backend. Elle change uniquement la couche UX de l'éditeur.

### 11.2 Nouveaux états React

Ajouter dans `PostEditor`:

```ts
type AssistantStatus =
  | { type: "idle" }
  | { type: "info"; message: string }
  | { type: "loading"; title: string; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const [assistantStatus, setAssistantStatus] = useState<AssistantStatus>({ type: "idle" });
const [previousContent, setPreviousContent] = useState<string | null>(null);
```

### 11.3 Règles d'état

#### Génération sans contenu

Condition: `content.trim() === ""`.

- Le bouton principal affiche `Générer un post`.
- Il est désactivé si `prompt.trim() === ""`.
- Aide affichée si prompt vide: `Décris le sujet du post pour lancer la génération.`
- Au clic:
  - `assistantStatus = loading` avec titre `Génération en cours...`.
  - Message: `Friend prépare ton post LinkedIn. Ça peut prendre quelques secondes selon le modèle IA.`
  - Label bouton: `Génération en cours...`.
  - Input prompt + select template désactivés.

#### Amélioration avec contenu

Condition: `content.trim() !== ""`.

- Le bouton principal affiche `Améliorer`.
- Il peut être cliqué même sans prompt.
- Aide affichée si prompt vide: `Ajoute une instruction ou clique Améliorer pour une amélioration générale.`
- Au clic:
  - Sauvegarder `previousContent = content` avant appel API.
  - `assistantStatus = loading` avec titre `Amélioration en cours...`.
  - Message: `Friend retravaille ton post sans supprimer ton brouillon original.`
  - Label bouton: `Amélioration en cours...`.

#### Succès génération/amélioration

- Si API retourne `content`, remplacer `content`.
- Génération: success `Post généré. Relis, ajuste puis score-le.`
- Amélioration: success `Post amélioré. Tu peux annuler si tu préfères l'ancienne version.`
- Si amélioration, afficher bouton `Annuler l'amélioration` tant que `previousContent !== null`.

#### Undo amélioration

Au clic `Annuler l'amélioration`:

- Restaurer `content = previousContent`.
- `previousContent = null`.
- Afficher info: `Version précédente restaurée.`

#### Erreur génération/amélioration

- Ne pas modifier le contenu existant.
- Afficher `assistantStatus = error`.
- Message: erreur API si disponible, sinon `La génération a échoué. Réessaie dans quelques secondes.`.
- Ne jamais utiliser `alert()` pour ces erreurs.

#### Scoring

- Bouton désactivé si `content.trim() === ""`.
- Texte d'aide si vide: `Écris ou génère un post avant de demander un score.`
- Au clic:
  - `assistantStatus = loading` avec titre `Analyse en cours...`.
  - Message: `Analyse du hook, de la clarté, de la structure et du potentiel d'engagement.`
  - Label bouton: `Analyse en cours...`.
- Succès:
  - Afficher carte score existante.
  - `assistantStatus = success` avec `Score prêt. Utilise le feedback pour améliorer ton post.`
- Erreur:
  - `assistantStatus = error` avec message API ou fallback.

### 11.4 Panneau de statut visuel

Afficher sous la ligne prompt/bouton.

Styles par type:

- loading: bordure violet/bleu, spinner, texte violet clair.
- success: bordure verte, texte vert clair.
- error: bordure rouge, texte rouge clair.
- info: bordure bleue/grise, texte gris clair.

Le panneau doit être compact et ne pas pousser excessivement le layout.

### 11.5 Tests manuels requis

1. Ouvrir `/linkedin/editor`.
2. Vérifier que `Générer un post` est désactivé avec aide visible si prompt vide.
3. Saisir un sujet; vérifier que le bouton s'active.
4. Cliquer générer; vérifier loading explicite.
5. Vérifier que le post remplit la zone de texte.
6. Vérifier que `Scorer ce post` devient actif.
7. Cliquer scorer; vérifier loading explicite puis score.
8. Modifier prompt d'amélioration; cliquer améliorer; vérifier loading + success.
9. Cliquer `Annuler l'amélioration`; vérifier restauration.
10. Exécuter `npm run lint` et `npm run build`.

## 12. Spécification détaillée Phase 2 — scoring actionnable

### 12.1 Objectif

Transformer le score IA en outil de décision/action. L'utilisateur ne doit pas seulement lire une note; il doit savoir quoi corriger et pouvoir relancer une amélioration basée sur ce feedback.

### 12.2 Carte de score cible

La carte score doit afficher:

- Score global `/100` avec couleur:
  - >= 80: vert, `Très bon potentiel`
  - 60–79: jaune, `À renforcer`
  - < 60: rouge, `À retravailler`
- Feedback IA.
- Checklist éditoriale statique pour guider la relecture:
  - `Hook`: la première ligne donne envie de lire.
  - `Clarté`: une idée principale, pas trop de dispersion.
  - `Structure`: paragraphes courts et scannables.
  - `CTA`: une question ou prochaine action claire.
- Hashtags cliquables à ajouter au post.
- Bouton principal: `Améliorer avec ce feedback`.

### 12.3 Améliorer avec le feedback

Au clic:

- Remplir/compléter l'instruction IA avec le feedback du score.
- Sauvegarder `previousContent` pour permettre undo.
- Relancer `/api/generate` en mode amélioration avec:
  - contenu actuel;
  - instruction: `Améliore ce post LinkedIn en appliquant ce feedback: ...`.
- Afficher les mêmes états que l'amélioration Phase 1.

### 12.4 Critères d'acceptation Phase 2

- Après scoring, la carte affiche un verdict lisible selon la note.
- La checklist éditoriale est visible.
- Les hashtags restent cliquables.
- Le bouton `Améliorer avec ce feedback` lance une amélioration IA.
- L'undo reste disponible après cette amélioration.
- `npm run lint` et `npm run build` passent.
