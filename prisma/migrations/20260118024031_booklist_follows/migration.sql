-- CreateTable
CREATE TABLE "BookListFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookListFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookListFollow_listId_createdAt_idx" ON "BookListFollow"("listId", "createdAt");

-- CreateIndex
CREATE INDEX "BookListFollow_userId_createdAt_idx" ON "BookListFollow"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BookListFollow_userId_listId_key" ON "BookListFollow"("userId", "listId");

-- AddForeignKey
ALTER TABLE "BookListFollow" ADD CONSTRAINT "BookListFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookListFollow" ADD CONSTRAINT "BookListFollow_listId_fkey" FOREIGN KEY ("listId") REFERENCES "BookList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
