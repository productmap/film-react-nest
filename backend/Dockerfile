#--------------------------------------------------------------------
#--- Stage 1: Base ---
#--------------------------------------------------------------------
FROM node:22-alpine AS base

# Используем короткий и понятный рабочий каталог
WORKDIR /app

#--------------------------------------------------------------------
#--- Stage 2: Dependencies ---
#--------------------------------------------------------------------
FROM base AS dependencies

RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

#--------------------------------------------------------------------
#--- Stage 3: Build ---
#--------------------------------------------------------------------
FROM base AS build

RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build

#--------------------------------------------------------------------
#--- Stage 4: Production ---
#--------------------------------------------------------------------
FROM base AS production

# Копируем файлы, меняя владельца на 'node' для безопасности
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node ./public ./public

# Переключаемся на непривилегированного пользователя
USER node

EXPOSE 3000

# Команда запуска осталась прежней, так как она относительна WORKDIR
CMD ["node", "dist/src/main"]
