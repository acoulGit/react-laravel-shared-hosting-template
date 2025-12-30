# React + Laravel (API) sur Shared Hosting (Bluehost) — Runbook (pattern validé)

Ce document décrit **pas à pas** la mise en place d’un déploiement **React/Vite** (frontend statique) + **Laravel API** (backend) sur un **shared hosting** (ex: Bluehost), avec authentification **Bearer token** (Sanctum) et CORS correctement configuré.

> Objectif : fournir un guide exécutable par un agent (ex: Cursor) pour reproduire la même configuration sur de futures apps.

---

## 0) Pré-requis

- 2 sous-domaines (ou 2 vhosts) :
  - Frontend : `https://APP.example.com`
  - API : `https://apiAPP.example.com`
- Shared hosting avec :
  - PHP 8.2+
  - Composer (ou possibilité de faire `composer install` en local puis upload)
  - Accès SSH (recommandé)
- Node **uniquement en local** (le shared hosting peut ne pas avoir Node).

---

## 1) Architecture de dépôt recommandée

```
repo/
  api/        # Laravel
  frontend/   # React/Vite
  docs/
```

Sur le serveur :
- Docroot du sous-domaine **API** → `repo/api/public`
- Docroot du sous-domaine **Frontend** → le contenu de `repo/frontend/dist` (déployé à la racine du sous-domaine)

---

## 2) Auth : choix qui évite les problèmes sur shared hosting

### Stratégie
- Auth **Bearer Token** (Sanctum `createToken()`).
- Frontend stocke le token en `localStorage`.
- Toutes les requêtes API ajoutent `Authorization: Bearer <token>`.

✅ Avantages :
- Pas de cookies stateful
- Pas de `SANCTUM_STATEFUL_DOMAINS` obligatoire
- Moins de problèmes CORS

---

## 3) Frontend : apiFetch CANONIQUE (anti “double stringify”)

**Règle d’or** : *ne jamais faire `JSON.stringify()` ailleurs que dans `apiFetch`.*

Fichier : `frontend/src/lib/api.ts`

- Ajoute toujours `Accept: application/json`
- Ajoute `Authorization: Bearer ...` si token présent
- `body` : stringify **uniquement si** objet (pas si string déjà)
- Gère correctement les erreurs Laravel (`message`, `errors`)

(Le template fournit un `apiFetch` prêt.)

---

## 4) Backend Laravel : endpoints requis

- `POST /api/login` : `{ email, password }` → `{ token, user }`
- `GET  /api/me` : Bearer requis → `{ id, name, email, role }`
- `POST /api/logout` : Bearer requis → 204

Le template fournit :
- `AuthController.php`
- routes `routes/api.php`

---

## 5) CORS : config propre pour prod

Fichier : `api/config/cors.php`

Points clés :
- `paths` doit inclure `api/*`
- `allowed_origins` doit inclure **l’URL du frontend prod**
- `supports_credentials` peut rester `true` (ok), mais pas obligatoire si Bearer

Exemple :

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [
  'https://APP.example.com',
],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

---

## 6) Apache / Bluehost : header Authorization parfois absent → MapAuthHeader

Sur certains Apache/shared hosting, `Authorization` n’arrive pas correctement en PHP.

Solution : middleware `MapAuthHeader` qui remappe `HTTP_AUTHORIZATION` / `REDIRECT_HTTP_AUTHORIZATION`.

Fichier : `api/app/Http/Middleware/MapAuthHeader.php` (fourni)

À brancher dans Laravel 11 : `api/bootstrap/app.php` (groupe `api`).

---

## 7) SPA routes : .htaccess obligatoire côté Frontend

Sur le docroot du frontend, ajouter `.htaccess` pour renvoyer les routes vers `index.html` :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule ^ index.html [L]
</IfModule>
```

Sans ça : refresh sur `/login` → 404.

---

## 8) Déploiement : workflow propre (Git = source de vérité)

### Local
1. Modifier le code en local
2. `git commit && git push`
3. Build frontend : `npm run build`
4. Déployer le contenu de `frontend/dist` vers le docroot frontend

### Serveur (API)
1. `cd ~/repo/api`
2. `git pull origin main`
3. `php artisan optimize:clear`

✅ Ne pas éditer en prod : toujours repasser par Git.

---

## 9) Debug rapide (checklist)

### CORS
```bash
curl -i -X OPTIONS https://apiAPP.example.com/api/login   -H "Origin: https://APP.example.com"   -H "Access-Control-Request-Method: POST"   -H "Access-Control-Request-Headers: content-type,accept"
```

Attendu :
- `204`
- `Access-Control-Allow-Origin: https://APP.example.com`

### Login
```bash
curl -i -X POST https://apiAPP.example.com/api/login   -H "Origin: https://APP.example.com"   -H "Accept: application/json"   -H "Content-Type: application/json"   -d '{"email":"admin@APP.test","password":"password123"}'
```

### JSON parsing (si besoin)
Créer temporairement une route debug (puis supprimer).

---

## 10) “Create admin” (pratique)
Le template inclut un exemple de commande artisan `parcapp:create-admin` **à adapter** à chaque app.

---

## 11) Fichiers à ne pas versionner
Ajouter à `.gitignore` côté API :
- `public/error_log`

---

## 12) Variables d’environnement

### Frontend : `frontend/.env.production`
```
VITE_API_BASE_URL=https://apiAPP.example.com
```

### Backend : `.env`
- `APP_ENV=production`
- `APP_DEBUG=false`
- DB configurée correctement
- Sanctum installé

---

## 13) Résultat attendu
- Login fonctionne depuis le frontend
- Token stocké en localStorage
- `GET /api/me` valide
- Reload SPA sans 404
- Git sync clean sur prod

