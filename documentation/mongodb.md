# MongoDB - AppBTP DevOps Lab

## Connexion

```bash
# Depuis l'host
mongosh "mongodb://admin:admin123@localhost:27017/appbtp?authSource=admin"

# Depuis un conteneur
docker exec -it appbtp-mongodb mongosh -u admin -p admin123
```

## Comptes de test

| Email                | Mot de passe   | Role       |
|----------------------|----------------|------------|
| admin@test.com       | admin123       | admin      |
| maitre@test.com      | maitre123      | pilote     |
| hommecle@test.com    | homme123       | hommeclé   |
| nettoyeur@test.com   | nettoyeur123   | nettoyeur  |

## Seed

```bash
docker compose run --rm seed
```
