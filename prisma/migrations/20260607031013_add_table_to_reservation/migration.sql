-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "tableId" INTEGER;

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AVAILABLE';

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;
