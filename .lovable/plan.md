

# Formatting minimal + titres de paragraphes — Page Rédaction

## Approche recommandée : Tiptap

Remplacer le `<textarea>` actuel par un éditeur **Tiptap** (basé sur ProseMirror). C'est la solution la plus adaptée car :
- Léger, headless (on garde notre design system)
- Supporte nativement gras, italique, souligné, barré, headings
- Le contenu est stocké en HTML ou JSON, ce qui permet d'extraire les titres pour la table des matières
- Compatible avec l'export Word futur
- Raccourcis clavier standards (Cmd+B, Cmd+I, etc.)

## Ce qui sera construit

### 1. Éditeur rich text minimal
- **Barre de formatage** discrète entre le titre du chapitre et le contenu, avec des icônes pour : **G** · *I* · <u>S</u> · ~~B~~ · Titre (H2)
- La barre apparaît toujours, style épuré (petites icônes toggle, séparateurs discrets)
- Raccourcis clavier fonctionnels

### 2. Titres de paragraphes dans la table des matières
- Les headings (H2) insérés dans l'éditeur sont **extraits automatiquement** du contenu
- Affichés dans la sidebar gauche, **indentés sous leur chapitre** avec une police plus petite
- Clic sur un titre = scroll vers ce heading dans l'éditeur

### 3. Stockage
- Le champ `content` du chapitre passe de texte brut à **HTML** (rétro-compatible : le texte existant sera wrappé dans `<p>`)
- L'insertion de passages continuera de fonctionner (ajout d'un paragraphe HTML)

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `package.json` | Ajout `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline` |
| `src/components/ChapterEditor.tsx` | **Nouveau** — composant éditeur Tiptap avec toolbar |
| `src/pages/ManuscritPage.tsx` | Remplacer le textarea par `<ChapterEditor>`, extraire les headings pour la sidebar |
| `src/lib/demoData.ts` | Convertir le contenu demo en HTML avec quelques H2 d'exemple |

## Aperçu de l'interface

```text
┌─ Chapitres ──────────┐  ┌─ Éditeur ─────────────────────────────┐
│ Chapitre 1            │  │ [Exporter]              [Passages]    │
│   ├ L'enfance         │  │──────────────────────────────────────── │
│   └ Les années lycée  │  │ B  I  U  S  │  Titre                  │
│ Chapitre 2            │  │──────────────────────────────────────── │
│ Chapitre 3            │  │                                        │
│   └ Le départ         │  │ Chapitre 1                            │
│                       │  │                                        │
│ + Nouveau chapitre    │  │ L'enfance                             │
└───────────────────────┘  │ Lorem ipsum dolor sit amet...         │
                           └────────────────────────────────────────┘
```

