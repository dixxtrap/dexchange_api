/*
  Warnings:

  - You are about to drop the `Tarnsfert` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TRANSFERT_CHANNEL" AS ENUM ('WAVE', 'OM');

-- CreateEnum
CREATE TYPE "TRANSFERT_STATUS" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESSS', 'FAILED', 'CANCELED');

-- DropTable
DROP TABLE "public"."Tarnsfert";

-- CreateTable
CREATE TABLE "Tarnsferts" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT,
    "channel" "TRANSFERT_CHANNEL" NOT NULL,
    "recipient" JSONB,
    "metadata" JSONB,
    "fees" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarnsferts_pkey" PRIMARY KEY ("id")
);
