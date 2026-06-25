-- CreateTable
CREATE TABLE "Resonance" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "sourcePostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resonance_pkey" PRIMARY KEY ("id")
);
