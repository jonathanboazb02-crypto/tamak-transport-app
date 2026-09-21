# TAMAK Transport — Application de suivi

Application de suivi et de gestion pour l'Établissement TAMAK Transport (transport de casiers de boissons Bralima vers les distributeurs, Kinshasa).

Construite avec la même chaîne technique que le projet SIGISPE : **TypeScript, Next.js, Prisma, PostgreSQL (Neon), déploiement Vercel**. C'est une **PWA (Progressive Web App)** : une seule application, responsive, installable sur téléphone comme une app native.

Ce projet correspond au cahier des charges `TAMAK_Cahier_des_charges.docx` fourni précédemment (mêmes modules, même matrice de rôles).

---

## 1. Prérequis

- Node.js 18 ou plus récent
- Un compte [Neon](https://neon.tech) (base de données PostgreSQL gratuite)
- Un compte [Vercel](https://vercel.com) pour le déploiement (optionnel en local)

## 2. Installation

```bash
npm install
```

## 3. Configuration de la base de données

1. Crée un projet sur [neon.tech](https://neon.tech) et copie la chaîne de connexion ("Connection string").
2. Copie `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```
3. Colle ta chaîne Neon dans `DATABASE_URL`, et génère une valeur aléatoire pour `NEXTAUTH_SECRET` (par exemple avec `openssl rand -base64 32`).

## 4. Créer les tables et les données de démarrage

```bash
npx prisma migrate dev --name init
npm run seed
```

Le script de seed crée :
- un compte administrateur : **admin@tamak-transport.cd** / **ChangeMoi123!** (à changer immédiatement après la première connexion)
- deux véhicules de démonstration

Pour visualiser/éditer les données directement :
```bash
npx prisma studio
```

## 5. Lancer l'application en local

```bash
npm run dev
```
Ouvre [http://localhost:3000](http://localhost:3000).

## 6. Déploiement (Vercel + Neon)

1. Pousse ce projet sur un dépôt Git (GitHub/GitLab).
2. Sur [vercel.com](https://vercel.com), importe le dépôt.
3. Ajoute les variables d'environnement `DATABASE_URL` et `NEXTAUTH_SECRET` dans les réglages du projet Vercel (`NEXTAUTH_URL` doit pointer vers ton domaine Vercel une fois déployé).
4. Déploie. Vercel exécute automatiquement `next build`.
5. Pense à exécuter `npx prisma migrate deploy` (via un script ou manuellement) pour appliquer les migrations sur la base Neon de production.

## 7. Installer l'application sur un téléphone (PWA)

Une fois l'application ouverte dans le navigateur mobile (Chrome/Safari) :
- **Android (Chrome)** : menu ⋮ → « Ajouter à l'écran d'accueil »
- **iPhone (Safari)** : bouton Partager → « Sur l'écran d'accueil »

L'application s'ouvre alors en plein écran, avec l'icône TAMAK, comme une app native.

---

## Structure du projet

```
prisma/schema.prisma       Modèle de données (Utilisateur, Employé, Véhicule, Course, Carburant, ...)
prisma/seed.ts             Données de démarrage
src/lib/auth.ts            Authentification (NextAuth, identifiants + rôles)
src/lib/rbac.ts            Matrice des permissions par module et catégorie (section 5 du cahier des charges)
src/middleware.ts          Protection des routes selon le rôle connecté
src/app/login              Page de connexion
src/app/(app)/...          Espace protégé : dashboard, vehicules, courses, carburant, equipe, analyse, utilisateurs, parametres
src/app/api/...            Routes API (lecture/écriture des données, avec vérification des permissions)
public/manifest.json       Manifeste PWA (icônes, couleurs, nom)
public/sw.js               Service worker (cache réseau/hors-ligne)
```

## État d'avancement par rapport au cahier des charges

| Module | État |
|---|---|
| Connexion / rôles / accès sécurisé | Fonctionnel |
| Tableau de bord | Fonctionnel (indicateurs calculés en direct) |
| Nos véhicules | Fonctionnel (liste + ajout) |
| Suivi des courses | Fonctionnel (liste + ajout ; la signature superviseur est un simple indicateur pour l'instant) |
| Consommation carburant | Fonctionnel (liste + ajout + récapitulatif automatique + filtre par véhicule) |
| Équipe | Fonctionnel (classée par catégorie + ajout) |
| Utilisateurs | Lecture seule pour l'instant (création de compte à brancher à l'annuaire Équipe) |
| Analyse de données | Version de base (comparatif par véhicule) — à enrichir avec des graphiques |
| Paramètres | Interface d'affichage seulement, pas encore éditable |
| Suivi des véhicules (GPS X-Moniteur) | En attente de l'API du fournisseur (voir section 7 du cahier des charges) — écran prêt à recevoir les données une fois branché |

## Prochaines étapes suggérées

- Brancher la création de compte utilisateur directement depuis la fiche Employé.
- Ajouter des graphiques (évolution du carburant, comparatif véhicules) sur la page Analyse.
- Génération PDF des fiches de course et de carburant (mise en page identique aux fiches papier actuelles).
- Intégration de l'API X-Moniteur dès qu'elle sera confirmée par le fournisseur.
