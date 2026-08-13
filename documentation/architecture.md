# Architecture AppBTP - DevOps Lab

## Vue d'ensemble

AppBTP est une application de suivi de chantiers BTP composee de :
- **Mobile** : React Native (Expo SDK 54)
- **Backend** : Node.js / Express / MongoDB
- **Worker** : Node.js / PDFKit (generation PDF asynchrone)
- **Frontend** : React + Vite

## Architecture technique

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Mobile    │────▶│   Backend    │────▶│  MongoDB    │
│  (Expo RN)  │     │  (Express)   │     │             │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
┌─────────────┐     ┌──────▼───────┐     ┌─────────────┐
│   Frontend  │────▶│  RabbitMQ    │────▶│   Worker    │
│  (React)    │     │              │     │  (PDFKit)   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                         ┌──────▼──────┐
                                         │   MongoDB   │
                                         └─────────────┘
```

## Services Docker

| Service       | Port  | Description                     |
|---------------|-------|---------------------------------|
| backend       | 8081  | API REST Node.js               |
| worker        | 9090  | Worker PDF asynchrone           |
| mongodb       | 27017 | Base de donnees MongoDB         |
| rabbitmq      | 5672  | File de messages RabbitMQ       |
| rabbitmq-mgmt | 15672 | Interface management RabbitMQ   |
| jenkins       | 8080  | Serveur CI/CD Jenkins           |
| prometheus    | 9091  | Monitoring metrics              |
| grafana       | 3000  | Dashboards monitoring           |
| loki          | 3100  | Centralisation logs             |
| promtail      | 9080  | Agent collecte logs             |

## Flux de donnees

1. **Mobile/Frontend** envoie une requete au Backend
2. **Backend** traite la requete, interagit avec MongoDB
3. Pour la generation PDF, le Backend publie un message dans RabbitMQ
4. **Worker** consomme le message, genere le PDF avec PDFKit
5. Le Worker met a jour le statut dans MongoDB

## Securite

- Authentification JWT (7 jours)
- Hash mot de passe: PBKDF2 (SHA-512)
- CORS configure par environment
- Rate limiting sur les endpoints publics
- Variables d'environnement pour les secrets
