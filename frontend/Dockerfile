# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto del código
COPY . .

# Variables de entorno para el build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build de producción
RUN npm run build

# Production stage con serve
FROM node:18-alpine

WORKDIR /app

# Instalar serve globalmente
RUN npm install -g serve

# Copiar build desde stage anterior
COPY --from=build /app/build ./build

# Railway usa PORT env variable
EXPOSE ${PORT:-3000}

# Servir la aplicación
CMD serve -s build -l ${PORT:-3000}