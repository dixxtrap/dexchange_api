#!/usr/bin/env sh
set -e

echo "⏳ Waiting for Postgres..."
until pg_isready -h db -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  sleep 2
done
echo "✅ Postgres ready."

echo "▶️ Prisma generate"
npx prisma generate

echo "▶️ Prisma migrate"
npx prisma migrate deploy

echo "🚀 Starting NestJS app"
npm run start:dev
