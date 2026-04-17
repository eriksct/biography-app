

## Plan : version mobile (mise à jour)

### Périmètre mobile (`<768px`)
L'utilisateur peut :
- Voir et choisir une biographie (HomePage)
- Voir la liste des entretiens d'une biographie
- Ouvrir un entretien : **transcript + lecteur audio uniquement**
- Lancer un nouvel enregistrement / uploader un fichier

On masque entièrement :
- La partie **Rédaction** (manuscrit / chapitres)
- Tout ce qui touche aux **étiquettes** (annotations, panneau notes, onglet Analyse qui agrège les étiquettes)

Sur ordi/tablette (≥768px), rien ne change.

### Détection
Hook existant `useIsMobile()` (breakpoint 768px).

### Changements par fichier

**1. `src/components/AppSidebar.tsx`**
- Sur mobile : remplacer la sidebar par une **barre supérieure compacte** (titre du projet + lien Accueil + UserMenu).
- Aucun lien "Rédaction". Pas de lien "Entretiens" (vue par défaut).

**2. `src/components/AppLayout.tsx`**
- Sur mobile : `flex-col` avec topbar au-dessus du `<main>`.

**3. `src/App.tsx`**
- Sur mobile, la route `/projet/:projectId/manuscrit` redirige vers `/projet/:projectId`.

**4. `src/pages/HomePage.tsx`**
- Padding réduit (`px-4 py-8`), header plus serré. Grille déjà responsive.

**5. `src/pages/InterviewsPage.tsx`**
- Padding réduit (`px-4 py-6`).
- Bouton "Nouvel entretien" → **FAB rond** en bas à droite sur mobile.
- Cartes simplifiées (numéro plus petit, layout vertical).

**6. `src/pages/InterviewDetailPage.tsx`** — page la plus impactée
- Sur mobile : afficher **uniquement le transcript** + le lecteur audio.
  - Pas d'onglets "Analyse" / "Étiquettes & notes".
  - Pas de panneau droit étiquettes/notes.
  - Pas de surlignage cliquable d'annotations dans le transcript (texte brut lisible).
- Header : padding réduit, bouton "Télécharger" en icône seule.
- Lecteur audio : sélecteur de vitesse masqué.

**7. `src/components/AnnotatedPassageText.tsx`**
- Sur mobile, rendu en texte simple (sans surbrillance d'étiquettes ni interactions d'annotation).

**8. `src/components/RecordingDialog.tsx`**
- Vérifier `flex-col sm:flex-row` sur les boutons "Fichier audio" / "Fichier texte" pour très petits écrans.

### Layout mobile vs desktop
```text
DESKTOP                          MOBILE
┌──────┬──────────────┐          ┌──────────────────┐
│ Side │   Contenu    │          │ Topbar (projet)  │
│ bar  │ (transcript  │          ├──────────────────┤
│      │  + étiquettes│          │   Transcript     │
│ Réd. │  + analyse)  │          │   + lecteur      │
└──────┴──────────────┘          └──────────────────┘
```

### Inchangé
- Logique métier (contextes, données)
- UX desktop / tablette (≥768px)
- Routes existantes

