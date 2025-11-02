/*
  Warnings:

  - The `status` column on the `Tarnsferts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Tarnsferts" DROP COLUMN "status",
ADD COLUMN     "status" "TRANSFERT_STATUS" NOT NULL DEFAULT 'PENDING';
