/*
  Warnings:

  - A unique constraint covering the columns `[ref]` on the table `Tarnsferts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tarnsferts_ref_key" ON "Tarnsferts"("ref");
