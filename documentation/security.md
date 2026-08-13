# Securite - AppBTP DevOps Lab

## Authentification

- JWT avec expiration 7 jours
- Hash: PBKDF2 SHA-512, 1000 iterations, 64 bytes
- Salt: 16 bytes aleatoires
- Cookies httpOnly en production

## Roles

| Role | Permissions |
|------|------------|
| admin | Acces complet, gestion utilisateurs |
| pilote | Remarques, rapports photos |
| hommeclé | Lecture seule chantiers |
| nettoyeur | Notes, constatations |
| user | Acces de base |

## Variables d'environnement

Les secrets ne doivent JAMAIS etre dans le code :
- JWT_SECRET
- MONGODB_URI
- CLOUDINARY_*
