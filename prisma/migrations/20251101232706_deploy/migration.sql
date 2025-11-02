/*
  Warnings:

  - The values [SUCCESSS] on the enum `TRANSFERT_STATUS` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TRANSFERT_STATUS_new" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELED');
ALTER TABLE "public"."Tarnsferts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Tarnsferts" ALTER COLUMN "status" TYPE "TRANSFERT_STATUS_new" USING ("status"::text::"TRANSFERT_STATUS_new");
ALTER TYPE "TRANSFERT_STATUS" RENAME TO "TRANSFERT_STATUS_old";
ALTER TYPE "TRANSFERT_STATUS_new" RENAME TO "TRANSFERT_STATUS";
DROP TYPE "public"."TRANSFERT_STATUS_old";
ALTER TABLE "Tarnsferts" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
