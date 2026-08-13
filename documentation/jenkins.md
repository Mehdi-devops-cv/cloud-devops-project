# Jenkins - AppBTP DevOps Lab

## Demarrage

```bash
docker compose up -d jenkins
```

## Acces

- URL: http://localhost:8080
- Pas de mot de passe (setup wizard desactive)

## Pipelines

### Backend Pipeline
- Stage 1: Checkout du code
- Stage 2: Installation des dependances (npm ci)
- Stage 3: Tests Jest
- Stage 4: Build image Docker
- Stage 5: Scan securite (Trivy)
- Stage 6: Deploiement Kubernetes

### Mobile Pipeline
- Stage 1: Checkout du code
- Stage 2: Installation des dependances
- Stage 3: Lint & Type Check
- Stage 4: Expo Doctor
- Stage 5: Build simule
- Stage 6: Rapport de build
