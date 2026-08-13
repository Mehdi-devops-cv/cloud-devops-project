# Docker - AppBTP DevOps Lab

## Demarrage rapide

```bash
# Copier le fichier d'environnement
cp .env.dev .env

# Lancer tous les services
docker compose up -d

# Verifier les services
docker compose ps

# Voir les logs
docker compose logs -f backend
```

## Services

### Backend
```bash
# Build
docker build -f docker/backend/Dockerfile -t appbtp-backend .

# Run
docker run -p 8081:8081 --env-file .env.dev appbtp-backend

# Logs
docker logs -f appbtp-backend
```

### Worker
```bash
# Build
docker build -f docker/worker/Dockerfile -t appbtp-worker .

# Run
docker run -p 9090:9090 appbtp-worker
```

### MongoDB
```bash
# Shell
docker exec -it appbtp-mongodb mongosh -u admin -p admin123

# Seed
docker compose run --rm seed
```

## Commandes utiles

```bash
# Rebuild apres modification
docker compose build --no-cache backend

# Redemarrer un service
docker compose restart backend

# Voir les healthchecks
docker inspect --format='{{.State.Health.Status}}' appbtp-backend

# Nettoyer
docker system prune -f
docker volume prune -f
```
