// Configuration des URLs pour différentes plateformes
// Backend local (développement - Docker)
const LOCAL_BACKEND_URL = 'http://localhost:8081';

// Backend Vercel (production)
const VERCEL_BACKEND_URL = 'https://appbtp-backend.vercel.app';

// Utiliser le backend local pour le DevOps lab
export const API_BASE_URL = LOCAL_BACKEND_URL;
