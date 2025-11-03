FROM node:20-alpine

WORKDIR /usr/src/app

# Libs pour prisma/openssl
RUN apk add --no-cache openssl

# Copie des manifests
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Choisis ton gestionnaire:
# RUN npm ci
RUN npm install

# Copie du code
COPY . .

# Prisma client (à la build, puis regénéré au run)
RUN npx prisma generate || true

EXPOSE 3000

# Le démarrage réel est fait par entrypoint.sh (migrate + start)
CMD ["sh", "./docker/entrypoint.sh"]
