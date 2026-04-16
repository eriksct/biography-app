

## Plan : Lecteur de passage dans l'onglet Étiquettes

### Contexte

Dans **Rédaction > Entretiens & Étiquettes > Étiquettes**, chaque passage a un bouton play (timestamp + icône). L'utilisateur veut que ce bouton ouvre un lecteur, comme dans l'onglet **Entretiens** quand on clique sur un entretien.

### Problème de design

Les passages listés dans l'onglet Étiquettes proviennent d'entretiens différents. On ne peut pas simplement afficher le transcript complet d'un seul entretien.

### Suggestion retenue

**Réutiliser la Dialog existante** (lignes 669+) qui affiche déjà le transcript complet d'un entretien avec le passage mis en surbrillance. Quand l'utilisateur clique sur le bouton play d'un passage :

1. La Dialog s'ouvre sur l'entretien correspondant
2. Le passage cliqué est scrollé et mis en surbrillance (fond coloré + ring) — comportement déjà implémenté
3. L'en-tête de la Dialog affiche clairement "Entretien n°X" avec la date et durée, ce qui lève toute ambiguïté sur la provenance

C'est cohérent car :
- Le clic sur le texte d'un passage ouvre déjà cette même Dialog (ligne 646)
- Le design est identique à la vue "Entretiens > Entretien"
- L'utilisateur sait toujours de quel entretien il s'agit grâce au header

### Modification

**Fichier : `src/pages/ManuscritPage.tsx`**

- **Brancher le bouton play** (lignes 637-643) : ajouter un `onClick` qui appelle `setDialogInterviewId(passage.interviewId)` et `setDialogPassageId(passage.id)` — exactement comme le clic sur le texte du passage (ligne 646).

C'est une modification d'une seule ligne : ajouter le handler `onClick` sur le `<button>` existant.

