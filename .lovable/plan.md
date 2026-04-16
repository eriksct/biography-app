## Plan : Page d'accueil multi-biographies

### Concept UX

**Page d'accueil** (`/`) : liste des biographies sous forme de cartes. Chaque carte affiche le nom du projet, le nombre d'entretiens et de chapitres. Actions : créer, renommer (inline), supprimer (avec confirmation).

**Navigation retour** : dans la sidebar, le nom du projet (déjà affiché en haut) devient un lien cliquable vers `/`. On ajoute une petite icône `ChevronLeft` ou `Home` à côté. En mode replié, l'icône "B" en bas devient un bouton retour accueil.

### Routing

```text
/                    → Page d'accueil (liste des biographies)
/projet/:projectId   → Entretiens (anciennement /)
/projet/:projectId/entretien/:id → Détail entretien
/projet/:projectId/manuscrit     → Rédaction
```

### Modifications techniques

1. **Types** (`src/lib/types.ts`) : rien à changer, `Project` existe déjà.
2. **Nouveau contexte global** (`src/lib/AppContext.tsx`) : gère une liste de `Project[]`, le projet sélectionné, et les actions CRUD (créer, renommer, supprimer, sélectionner). Le `ProjectProvider` existant reste pour le projet courant mais reçoit son `project` depuis `AppContext`.
3. **Page d'accueil** (`src/pages/HomePage.tsx`) : grille de cartes pour chaque biographie + bouton "Nouvelle biographie". Menu contextuel (trois points) sur chaque carte pour renommer/supprimer. Dialog de confirmation pour la suppression.
4. **Routing** (`src/App.tsx`) : nouvelle route `/` pour `HomePage`. Les routes existantes passent sous `/projet/:projectId/...`. Le `ProjectProvider` wrappera uniquement les routes projet et chargera le bon projet depuis `AppContext`.
5. **Sidebar** (`src/components/AppSidebar.tsx`) : le nom du projet en haut devient un `Link` vers `/` avec une icône `Home` ou `ChevronLeft`. En mode replié, même chose avec juste l'icône.
6. **Données démo** : la biographie existante "Mémoires de Jeanne Moreau" reste comme projet de démo dans la liste initiale.

### Ce que l'utilisateur verra

- Au lancement : une page épurée avec la biographie existante en carte, et un bouton pour en créer une nouvelle.
- Clic sur une carte → entre dans la biographie (entretiens).
- Dans la sidebar : le nom du projet est cliquable pour revenir à l'accueil (discret, pas de place supplémentaire).  


Il faut respecter le design system existant pour que cela s'intègre bien

&nbsp;

&nbsp;

&nbsp;

&nbsp;