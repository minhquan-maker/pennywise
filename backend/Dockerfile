# PennyWise API — production image (PostgreSQL via DATABASE_URL)
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
# Provide DATABASE_URL (and DATABASE_URL_UNPOOLED) for a PostgreSQL database at runtime
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
