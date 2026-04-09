# Panneau droit Rédaction — Onglets "Entretiens" et "Thèmes"

## Ce qui change

Le panneau droit (w-96) actuellement titré "Passages disponibles" sera restructuré avec **deux onglets** en haut :

### Onglet "Entretiens"

- Liste des entretiens disponibles (boutons/cards cliquables)
- Quand un entretien est sélectionné :
  - Bouton retour pour revenir à la liste
  - Lecteur audio `<audio controls>` (placeholder — pas d'URL audio réelle dans les données actuelles, mais le player sera prêt)
  - Transcription complète : tous les passages de l'entretien affichés à la suite, avec timestamps et thèmes

### Onglet "Thèmes"

- Contenu identique à l'actuel : filtres (statut, thème, entretien) + liste de passages filtrés

## Modifications techniques


| Fichier                       | Changement                                                                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/ManuscritPage.tsx` | Ajout d'un état `panelTab` (`'entretiens' | 'themes'`), d'un état `selectedInterviewId` pour l'onglet Entretiens. Restructuration du panneau droit avec les deux onglets et leur contenu respectif. |


Aucun nouveau fichier, aucune nouvelle dépendance. L'interface `Interview` a déjà toutes les données nécessaires (passages, date, duration). Le champ audio sera préparé mais vide pour l'instant (les interviews n'ont pas encore de `audioUrl`).

## Aperçu

```text
┌─ Panneau droit ──────────────┐
│  [Entretiens]  [Thèmes]     │  ← onglets
│──────────────────────────────│
│  (si onglet Entretiens)      │
│  ← Retour                   │
│  ▶ ━━━━━━━━━━━ 00:45:00     │  ← audio player
│                              │
│  00:03:21                    │
│  "Texte du passage..."      │
│  [Enfance] [Famille]        │
│                              │
│  00:07:45                    │
│  "Autre passage..."         │
│  [Voyage]                   │
│──────────────────────────────│
│  (si onglet Thèmes)         │
│  → filtres + passages        │
│  (comme actuellement)        │
└──────────────────────────────┘
```