# ==============================================================================
# Frontend iMDB Admin — React + TypeScript (Vite)
# Estágio 1: compila/bundleia a SPA. Estágio 2: Nginx serve os arquivos
# estáticos com fallback para index.html (single page application).
# ==============================================================================

# --- Estágio de construção ---
FROM node:20-alpine AS construcao

WORKDIR /app

# Dependências primeiro (aproveita cache de camadas)
COPY package*.json ./
RUN npm install

# Código e build
COPY . .
RUN npm run build

# --- Estágio de execução ---
FROM nginx:1.27-alpine AS execucao

COPY --from=construcao /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
