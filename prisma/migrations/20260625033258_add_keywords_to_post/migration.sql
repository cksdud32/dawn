-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
