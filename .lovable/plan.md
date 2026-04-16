

## Plan : Répliquer le positionnement intelligent du popup d'étiquettes dans le panneau Manuscrit

### Problème

Dans la page Manuscrit > Entretiens & Étiquettes > vue d'un entretien, le popup d'assignation d'étiquettes utilise un positionnement simple (`top + 8px`) sans vérifier l'espace disponible. Si le texte sélectionné est en bas de l'écran, le popup est tronqué — exactement le bug corrigé dans `InterviewDetailPage`.

### Modifications

**Fichier : `src/pages/ManuscritPage.tsx`**

1. **Ajouter `bottom` au state `selectionInfo`** (lignes 34-40) : passer de `{ top, left }` à `{ top, bottom, left }` pour le `rect`, comme dans `InterviewDetailPage`.

2. **Mettre à jour `handleTextSelectManuscrit`** (ligne 93-96) : stocker `rect.top`, `rect.bottom` et `rect.left + rect.width / 2` en coordonnées viewport (sans `window.scrollY`).

3. **Appliquer le flip-up au popup** (lignes 484-543) : calculer `popupHeight`, `spaceBelow`, `flipUp` et basculer entre `top` et `bottom` en CSS, ajouter `max-h-[60vh] overflow-y-auto` — logique identique à celle de `InterviewDetailPage` (lignes 546-559).

Aucune autre modification nécessaire.

