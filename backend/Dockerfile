# PennyWise API — production image (SQLite on a mounted volume)
FROM node:20-slim
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=3000
# Mount a persistent volume at /data so the database survives deploys
ENV DATABASE_URL="file:/data/pennywise.db"
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
