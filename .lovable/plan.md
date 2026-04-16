

## Plan : Authentification et profil utilisateur

### Approche proposée

Utiliser **Lovable Cloud** (Supabase intégré) pour l'authentification. Cela fournit automatiquement une base Supabase avec `auth.users`, sans configuration externe.

### Ce que l'utilisateur verra

1. **Page de connexion** (`/login`) : formulaire email + mot de passe, avec options "Créer un compte" et "Mot de passe oublié". Design cohérent avec le style éditorial existant (Lora, tons chauds).

2. **Page d'inscription** (`/signup`) : formulaire email + mot de passe + confirmation. Redirection vers la page d'accueil après validation.

3. **Page de réinitialisation** (`/reset-password`) : formulaire pour définir un nouveau mot de passe après clic sur le lien reçu par email.

4. **Menu profil** dans le header de la page d'accueil et dans le footer de la sidebar : un petit avatar (initiales de l'email) cliquable qui ouvre un dropdown avec :
   - Email de l'utilisateur
   - "Mon profil" (page minimale)
   - "Se déconnecter"

5. **Page profil** (`/profil`) : affichage de l'email, possibilité de changer le mot de passe. Rien de plus pour l'instant.

6. **Routes protégées** : toutes les pages sauf `/login`, `/signup` et `/reset-password` nécessitent d'être connecté. Redirection automatique vers `/login` si non authentifié.

### Modifications techniques

1. **Activer Lovable Cloud** pour obtenir le client Supabase (`@supabase/supabase-js`).

2. **Contexte d'auth** (`src/lib/AuthContext.tsx`) : provider React qui écoute `onAuthStateChange`, expose `user`, `loading`, `signIn`, `signUp`, `signOut`, `resetPassword`.

3. **Client Supabase** (`src/integrations/supabase/client.ts`) : créé automatiquement par Lovable Cloud.

4. **Pages auth** :
   - `src/pages/LoginPage.tsx` : connexion email/mot de passe
   - `src/pages/SignupPage.tsx` : inscription
   - `src/pages/ResetPasswordPage.tsx` : nouveau mot de passe
   - `src/pages/ProfilePage.tsx` : profil minimal

5. **Composant `UserMenu`** (`src/components/UserMenu.tsx`) : avatar + dropdown (profil, déconnexion). Intégré dans `HomePage` (header) et `AppSidebar` (footer).

6. **Route guard** (`src/components/ProtectedRoute.tsx`) : wrapper qui redirige vers `/login` si non authentifié.

7. **Routing** (`src/App.tsx`) : ajout des routes publiques (`/login`, `/signup`, `/reset-password`) et wrapping des routes existantes dans `ProtectedRoute`.

8. **Données** : les biographies restent en mémoire locale pour l'instant (pas de persistance en base). L'auth sert uniquement à identifier l'utilisateur.

### Question ouverte

Faut-il aussi proposer la connexion via Google, ou email/mot de passe suffit pour commencer ?

