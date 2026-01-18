/*
  Warnings:

  - The `visibility` column on the `BookList` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,slug]` on the table `BookList` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[listId,bookId]` on the table `BookListItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BookListVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'UNLISTED');

-- DropForeignKey
ALTER TABLE "BookList" DROP CONSTRAINT "BookList_userId_fkey";

-- DropForeignKey
ALTER TABLE "BookListItem" DROP CONSTRAINT "BookListItem_listId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- AlterTable
ALTER TABLE "BookList" DROP COLUMN "visibility",
ADD COLUMN     "visibility" "BookListVisibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateIndex
CREATE INDEX "BookList_userId_idx" ON "BookList"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BookList_userId_slug_key" ON "BookList"("userId", "slug");

-- CreateIndex
CREATE INDEX "BookListItem_listId_createdAt_idx" ON "BookListItem"("listId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BookListItem_listId_bookId_key" ON "BookListItem"("listId", "bookId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookList" ADD CONSTRAINT "BookList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookListItem" ADD CONSTRAINT "BookListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "BookList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
