FROM node:22-alpine

WORKDIR /app

# Установим сборочные утилиты (на случай нативных зависимостей)
# RUN apk add --no-cache python3 make g++

# COPY package*.json ./
COPY . .

RUN npm ci

CMD ["npm", "run", "build"]
# /app/dist
