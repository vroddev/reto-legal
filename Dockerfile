# RETO LEGAL — imagen para desplegar en Render como Web Service.
#
# Base: Node LTS (22) oficial. El juego se construye y se sirve con Bun
# 1.3.10 (el mismo runtime con el que se compila dentro de Muse: el
# servidor usa bun:sqlite y el SDK de espacios se empaqueta con Bun), así
# que Bun se instala globalmente sobre la imagen de Node y todo lo demás
# es el pipeline normal del proyecto.
FROM node:22-bookworm-slim

RUN npm install --global bun@1.3.10

WORKDIR /app

# Primero solo el manifiesto de despliegue y el SDK vendorizado, para
# aprovechar la caché de capas de Docker en la instalación.
COPY vendor/space-sdk.tgz ./vendor/space-sdk.tgz
COPY deploy/package.json ./package.json
COPY bunfig.toml ./bunfig.toml
RUN bun install

# Código del juego (cliente, acciones del servidor y servidor autónomo).
# space.json se copia porque el compilador de despliegue lee de ahí la
# versión de plataforma que se incrusta en el cliente.
COPY space.json ./space.json
COPY client ./client
COPY server ./server
COPY deploy ./deploy

# Compila el cliente (client/dist) y el servidor autónomo (deploy/dist).
RUN bun run build

ENV NODE_ENV=production
# Render inyecta su propia variable PORT al arrancar; el servidor la lee
# con 10000 como respaldo local. EXPOSE es solo documentación.
EXPOSE 10000

CMD ["bun", "run", "start"]
