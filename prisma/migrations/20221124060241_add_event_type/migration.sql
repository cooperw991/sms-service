-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sms_tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventNum" TEXT NOT NULL,
    "eventMsg" TEXT NOT NULL,
    "eventTime" TEXT NOT NULL,
    "eventTargets" TEXT NOT NULL,
    "eventType" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_sms_tasks" ("createdAt", "eventMsg", "eventNum", "eventTargets", "eventTime", "id", "status", "updatedAt") SELECT "createdAt", "eventMsg", "eventNum", "eventTargets", "eventTime", "id", "status", "updatedAt" FROM "sms_tasks";
DROP TABLE "sms_tasks";
ALTER TABLE "new_sms_tasks" RENAME TO "sms_tasks";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
