# Incident Response - AppBTP DevOps Lab

## Procedures de diagnostic

### Backend ne repond pas
```bash
# 1. Verifier l'etat du conteneur
docker ps | grep backend

# 2. Voir les logs
docker logs --tail 100 appbtp-backend

# 3. Verifier le healthcheck
curl http://localhost:8081/health

# 4. Redemarrer
docker compose restart backend
```

### MongoDB inaccessible
```bash
# 1. Verifier le conteneur
docker ps | grep mongodb

# 2. Tester la connexion
docker exec appbtp-mongodb mongosh --eval "db.adminCommand('ping')"

# 3. Verifier les logs
docker logs --tail 50 appbtp-mongodb
```

### Jenkins ne demarre pas
```bash
# 1. Verifier l'espace disque
docker system df

# 2. Verifier les logs
docker logs --tail 100 appbtp-jenkins

# 3. Redemarrer avec plus de memoire
docker compose up -d --force-recreate jenkins
```

### PDF Worker ne traite pas
```bash
# 1. Verifier RabbitMQ
curl -u guest:guest http://localhost:15672/api/overview

# 2. Verifier les files d'attente
curl -u guest:guest http://localhost:15672/api/queues

# 3. Verifier les logs du worker
docker logs --tail 100 appbtp-worker
```

### Prometheus ne scrape pas
```bash
# 1. Verifier la config
curl http://localhost:9091/api/v1/targets

# 2. Verifier les cibles
curl http://localhost:9091/api/v1/query?query=up
```

## Destruction volontaire (exercices)

### Detruire le backend
```bash
docker stop appbtp-backend
docker rm appbtp-backend
# Diagnostic: healthcheck echoue, Prometheus alerte
```

### Detruire MongoDB
```bash
docker stop appbtp-mongodb
docker rm appbtp-mongodb
# Diagnostic: Backend ne peut pas se connecter, logs d'erreur
```

### Detruire RabbitMQ
```bash
docker stop appbtp-rabbitmq
docker rm appbtp-rabbitmq
# Diagnostic: PDF worker ne recoit plus de messages
```

### Remettre en etat
```bash
docker compose up -d
docker compose run --rm seed
```
