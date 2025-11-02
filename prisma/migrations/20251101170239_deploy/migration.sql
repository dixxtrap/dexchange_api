/*
  Warnings:

  - Added the required column `ref` to the `Tarnsferts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tarnsferts" ADD COLUMN     "ref" TEXT NOT NULL;
