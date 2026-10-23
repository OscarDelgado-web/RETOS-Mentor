CREATE TABLE "AcademicResource" (
    "id" SERIAL NOT NULL,
    "topicId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicResource_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AcademicResource_topicId_isActive_idx" ON "AcademicResource"("topicId", "isActive");

ALTER TABLE "AcademicResource" ADD CONSTRAINT "AcademicResource_topicId_fkey"
FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
