// Configuration API pour la webapp AppBTP
// Backend local (développement)
const DEV_API = 'http://localhost:8081';
// Backend AWS (production) - défini via VITE_API_URL dans Jenkins
const PROD_API = 'https://api.appbtp.com';
export const API_BASE_URL = import.meta.env.VITE_API_URL || DEV_API;

export const endpoints = {
  login: '/login',
  register: '/register',
  user: '/user',
  cities: '/cities',
  chantiers: '/chantiers',
  batiments: '/batiments',
  notes: '/notes',
  constatations: '/constatations',
  effectifs: '/effectifs'
};