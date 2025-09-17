# ---- Этап 1: Сборка (Builder) ----
FROM node:22-slim AS base

# Используем короткий и понятный рабочий каталог
WORKDIR /app

# ---- Этап 2: Dependencies ----
FROM base AS dependencies

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# ---- Этап 3: сборка ----
FROM base AS build

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build

# ---- Этап 4: Продакшен (Production) ----
FROM base AS production

# Копируем файлы, меняя владельца на 'node' для безопасности
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node ./public ./public
RUN mkdir ./logs && chown node:node ./logs

USER node

EXPOSE 3000

CMD ["node", "dist/src/main"]
