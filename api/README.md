# API (Laravel) — template notes

Ce dossier contient les **fichiers clés** à recopier/appliquer dans un projet Laravel 11.

⚠️ Le template ne contient pas tout Laravel (vendor, etc.).
Crée un projet Laravel standard, puis applique :
- `config/cors.php`
- `routes/api.php`
- `app/Http/Controllers/AuthController.php`
- `app/Http/Middleware/MapAuthHeader.php`
- patch `bootstrap/app.php` pour enregistrer le middleware dans le groupe `api`

Voir : `../docs/DEPLOY_SHARED_HOSTING_RUNBOOK.md`
