CREATE TYPE "CoinTransactionType" AS ENUM ('AFFILIATE_EARNING', 'PURCHASE', 'WITHDRAWAL', 'WITHDRAWAL_REFUND', 'ADMIN_ADJUSTMENT');
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

ALTER TABLE "User"
  ADD COLUMN "founderCode" TEXT,
  ADD COLUMN "affiliateCommission" DECIMAL(5,2) NOT NULL DEFAULT 10.00;

CREATE UNIQUE INDEX "User_founderCode_key" ON "User"("founderCode");

ALTER TABLE "Order"
  ADD COLUMN "founderCodeUsed" TEXT,
  ADD COLUMN "referredFounderId" TEXT,
  ADD COLUMN "affiliateCommission" DECIMAL(10,2),
  ADD COLUMN "affiliateCreditedAt" TIMESTAMP(3);

CREATE INDEX "Order_referredFounderId_idx" ON "Order"("referredFounderId");
ALTER TABLE "Order" ADD CONSTRAINT "Order_referredFounderId_fkey" FOREIGN KEY ("referredFounderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "CoinTransaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "CoinTransactionType" NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "description" TEXT,
  "orderId" TEXT,
  "withdrawalId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CoinTransaction_userId_createdAt_idx" ON "CoinTransaction"("userId", "createdAt");
CREATE INDEX "CoinTransaction_orderId_idx" ON "CoinTransaction"("orderId");
CREATE INDEX "CoinTransaction_withdrawalId_idx" ON "CoinTransaction"("withdrawalId");
CREATE UNIQUE INDEX "CoinTransaction_orderId_type_key" ON "CoinTransaction"("orderId", "type");
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Withdrawal" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "bankName" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
  "adminNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Withdrawal_userId_idx" ON "Withdrawal"("userId");
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");
CREATE INDEX "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");
CREATE UNIQUE INDEX "Withdrawal_one_pending_per_user_key" ON "Withdrawal"("userId") WHERE "status" = 'PENDING';
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "Withdrawal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
