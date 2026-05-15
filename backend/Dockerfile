FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci

COPY backend/src ./src

COPY backend/tsconfig.json ./

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Copy database files for migrations
COPY database ./database

EXPOSE 3000

# Run migrations on startup, then start the app
CMD ["sh", "-c", "node dist/database/migrate.js && node dist/index.js"]
