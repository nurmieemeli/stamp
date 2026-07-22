-- AlterTable
ALTER TABLE "User" ADD COLUMN "isPro" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "proPurchasedAt" DATETIME;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "customAccent" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL DEFAULT '',
    "amountTotal" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeCheckoutSessionId_key" ON "Purchase"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");
