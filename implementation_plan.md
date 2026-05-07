# Mission Control v2 — Roadmap Taplio Killer

## État des lieux

Le design system, le layout sidebar, et la majorité des composants UI sont en place. L'éditeur a déjà le layout 3 colonnes, le scoring auto, l'auto-save, les raccourcis clavier, et le preview LinkedIn basique. On part d'une base solide.

## Acte 1 — L'éditeur (là où le produit se vend)

L'objectif : un éditeur qui fait dire "wow" en 5 secondes. C'est la page de conversion.

### 1.1 Upload d'images dans l'éditeur
- Bouton upload + drag & drop dans l'éditeur
- Preview de l'image dans le preview LinkedIn
- Intégration avec `uploadImageToLinkedIn()` déjà prêt dans `maton.ts`
- L'image attachée est sauvegardée avec le post (reste en brouillon)

### 1.2 Preview LinkedIn réaliste
- Photo de profil réelle + nom + headline en dessous
- Posts longs tronqués à ~5 lignes avec "…voir plus" cliquable (expand/collapse)
- Barre d'engagement LinkedIn-like : 👍 Like · 💬 Comment · 🔄 Repost · ✉️ Send
- Si une image est uploadée : affichée dans le preview comme LinkedIn (image sous le texte)

### 1.3 Toolbar de formatage
- Boutons dans la toolbar de l'éditeur : **B** (Unicode bold), *I* (Unicode italic), séparateur `─────`, puces `•`
- Emoji picker rapide (top 12 emojis LinkedIn : 🔥🚀💡🎯⚡🎬👇✅❌💪🧠✨)
- Appliquer le formatage au texte sélectionné ou insertion simple

### 1.4 Diff before/after
- Après une amélioration IA, afficher un diff visuel
- Mots ajoutés en vert, supprimés en rouge barré
- Bouton "Annuler" pour revenir à la version précédente (déjà fait)

### 1.5 Compteur de caractères intelligent
- Le compteur actuel (chars) est bien, ajouter une jauge visuelle
- Barre de progression colorée : < 800 = orange, 800-3000 = vert, > 3000 = rouge
- Indiquer la zone idéale LinkedIn en dessous (1300-2000 caractères = meilleure rétention)

---

## Acte 2 — Les formats gagnants

Ce qui manque pour être au niveau de Taplio sur les formats.

### 2.1 Carrousel PDF
- Upload PDF → Maton API (`POST /linkedin/documents`)
- Preview du PDF dans le preview LinkedIn
- Mention "Document joint" dans la preview

### 2.2 Multi-images
- Support 2-20 images par post
- Grid preview dans l'éditeur et le preview LinkedIn

### 2.3 Templates CRUD complet
- Créer, éditer, dupliquer, supprimer un template (actuellement read-only)
- Compteur d'usage par template ("Utilisé 12 fois")
- Preview du dernier post généré avec ce template

---

## Acte 3 — L'expérience qui fidélise

### 3.1 Dashboard vivant
- Message personnalisé : "Bonjour {{firstName}}, cette semaine…"
- Mini sparkline SVG d'activité (posts publiés par jour sur 7 jours)
- Section "Prochaines publications" avec timeline
- Section "Brouillons récents" avec barre de progression + score
- Statistique qui change : "Ton score moyen est 76/100, +4 pts cette semaine"

### 3.2 Analytics visuels
- Graphique d'engagement par post (barres horizontales SVG)
- Heatmap de publication (quel jour × heure performe le mieux)
- Top 5 posts avec extrait + score
- Corrélation score IA vs engagement réel (prouver la valeur du scoring)

### 3.3 Kanban pour les idées
- 3 colonnes : Fresh → Developing → Used
- Drag & drop entre colonnes
- Animation fluide quand une carte change de colonne
- Bouton "Générer des idées" → IA suggère 5 idées basées sur les thématiques existantes

### 3.4 Smart scheduling
- Dans l'éditeur : bouton "Meilleur moment" qui suggère une date/heure optimale
- Heuristique simple : mardi/mercredi/jeudi 8h-9h ou 12h-13h
- Basé sur l'historique si assez de données

### 3.5 Batch amélioré
- Progress par post (un loader par post en cours de génération)
- Aperçu en grille des posts générés (déjà fait)
- Actions groupées : sélectionner plusieurs → planifier/scorer en lot
- Suggestion auto de planning (1 post/jour à 9h)

---

## Acte 4 — Polish & Conversion

### 4.1 Onboarding flow
- Premier lancement : wizard 3 étapes
  - Étape 1 : Connecter LinkedIn (vérifier que l'API Maton fonctionne)
  - Étape 2 : Générer un premier post (choisir un template, entrer un sujet)
  - Étape 3 : Découvrir le score (le post est scoré, expliquer ce que ça signifie)
- Objectif : de 0 à premier post scoré en < 2 minutes

### 4.2 Responsive mobile
- Sidebar → hamburger menu sur mobile
- Éditeur → layout vertical (pas 3 colonnes)
- Preview LinkedIn → taille réduite mais lisible
- Calendrier → mois navigable, sans le panneau latéral (full width)

### 4.3 Export
- Export CSV des analytics
- Export posts (format texte / JSON)

---

## Ordre d'exécution

| # | Feature | Effort | Priorité |
|---|---------|--------|----------|
| 1 | Upload d'images dans l'éditeur | 1j | 🔴 Immédiat |
| 2 | Preview LinkedIn réaliste (voir plus, image preview) | 0.5j | 🔴 Immédiat |
| 3 | Toolbar de formatage (bold, italic, séparateurs, emojis) | 0.5j | 🔴 Immédiat |
| 4 | Diff before/after | 0.5j | 🟡 Cette semaine |
| 5 | Compteur intelligent (jauge visuelle) | 0.5j | 🟡 Cette semaine |
| 6 | Dashboard vivant (sparkline, bonjour, suggestions) | 1j | 🟡 Cette semaine |
| 7 | Analytics visuels (graphiques SVG, heatmap) | 1j | 🟡 Cette semaine |
| 8 | Kanban Ideas (drag & drop) | 1j | 🟢 Semaine pro |
| 9 | Templates CRUD | 1j | 🟢 Semaine pro |
| 10 | Smart scheduling | 0.5j | 🟢 Semaine pro |
| 11 | Batch amélioré (progress, actions groupées) | 0.5j | 🟢 Semaine pro |
| 12 | Carrousel PDF | 2j | 🟢 Semaine pro |
| 13 | Onboarding flow | 1j | 🟢 Avant lancement |
| 14 | Responsive mobile | 1j | 🟢 Avant lancement |
| 15 | Export CSV | 0.5j | 🟢 Nice to have |

## Questions à trancher

- **Q1** : On garde Tailwind ? (oui, déjà utilisé partout)
- **Q2** : Multi-compte LinkedIn en v1 ? (non, complique trop)
- **Q3** : BasePath `/linkedin` → `/` ? (à voir selon le domaine)
- **Q4** : LLM prod ? Ollama local OK pour lancement, cloud plus tard
