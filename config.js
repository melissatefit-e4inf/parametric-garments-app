// Configuration centrale - À mettre à jour quand l'URL ngrok change
const API_BASE = location.hostname.includes('github.io')
  ? 'https://presystolic-ann-quintic.ngrok-free.dev'
  : 'http://localhost:8000';