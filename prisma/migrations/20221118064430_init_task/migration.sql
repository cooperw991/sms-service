/*
  Warnings:

  - You are about to drop the `Alarm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Alarm";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "sms_tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventNum" TEXT NOT NULL,
    "eventMsg" TEXT NOT NULL,
    "eventTime" TEXT NOT NULL,
    "eventTargets" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
