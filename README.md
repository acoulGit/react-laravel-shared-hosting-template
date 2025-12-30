# React + Laravel — Shared Hosting Ready (Bluehost-friendly template)

Template repo pour déployer :
- **Frontend** : React + Vite (build statique `dist/`) sur shared hosting
- **Backend** : Laravel API (Sanctum Bearer tokens) sur shared hosting
- CORS prod-ready
- Middleware `MapAuthHeader` (Apache Authorization header quirks)
- `.htaccess` SPA frontend

## Structure
```
api/        # Laravel API
frontend/   # React/Vite app
docs/       # Runbook de déploiement
```

## Démarrage rapide (local)

### 1) Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 2) API (Laravel)
```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Déploiement (prod/shared hosting)
Voir : `docs/DEPLOY_SHARED_HOSTING_RUNBOOK.md`

## Notes
- Le frontend doit pointer vers l’API via `VITE_API_BASE_URL`.
- Auth via Bearer token (Sanctum).
