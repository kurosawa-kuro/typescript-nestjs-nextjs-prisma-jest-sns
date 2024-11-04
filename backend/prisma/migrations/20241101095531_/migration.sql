-- AlterTable
ALTER TABLE "Micropost" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MicropostView" (
    "id" SERIAL NOT NULL,
    "micropostId" INTEGER NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MicropostView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MicropostView_micropostId_idx" ON "MicropostView"("micropostId");

-- CreateIndex
CREATE UNIQUE INDEX "MicropostView_micropostId_ipAddress_key" ON "MicropostView"("micropostId", "ipAddress");

-- AddForeignKey
ALTER TABLE "MicropostView" ADD CONSTRAINT "MicropostView_micropostId_fkey" FOREIGN KEY ("micropostId") REFERENCES "Micropost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
