import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento local (npm run dev fora do Docker), o proxy encaminha
// /api e /arquivos para o Nginx da infraestrutura (porta do .env, padrão 8080).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/arquivos': 'http://localhost:8080',
    },
  },
});
