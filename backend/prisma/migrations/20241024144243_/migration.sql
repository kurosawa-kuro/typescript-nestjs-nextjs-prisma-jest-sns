/*
  Warnings:

  - You are about to drop the column `achievements` on the `Career` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Career` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Career` table. All the data in the column will be lost.
  - You are about to drop the column `employmentType` on the `Career` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Career` table. All the data in the column will be lost.
  - You are about to drop the column `isCurrent` on the `Career` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Career` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Career` table. All the data in the column will be lost.
  - You are about to drop the column `teamSize` on the `Career` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `CareerProject` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `CareerProject` table. All the data in the column will be lost.
  - You are about to drop the column `responsibilities` on the `CareerProject` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `CareerProject` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `CareerProject` table. All the data in the column will be lost.
  - You are about to drop the column `teamSize` on the `CareerProject` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `CareerSkill` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `CareerSkill` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `isPopular` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `UserSkill` table. All the data in the column will be lost.
  - You are about to drop the column `experienceYears` on the `UserSkill` table. All the data in the column will be lost.
  - You are about to drop the column `isMain` on the `UserSkill` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsedAt` on the `UserSkill` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `UserSkill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Career" DROP COLUMN "achievements",
DROP COLUMN "department",
DROP COLUMN "description",
DROP COLUMN "employmentType",
DROP COLUMN "endDate",
DROP COLUMN "isCurrent",
DROP COLUMN "position",
DROP COLUMN "startDate",
DROP COLUMN "teamSize";

-- AlterTable
ALTER TABLE "CareerProject" DROP COLUMN "description",
DROP COLUMN "endDate",
DROP COLUMN "responsibilities",
DROP COLUMN "role",
DROP COLUMN "startDate",
DROP COLUMN "teamSize";

-- AlterTable
ALTER TABLE "CareerSkill" DROP COLUMN "description",
DROP COLUMN "level";

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "isPopular";

-- AlterTable
ALTER TABLE "UserSkill" DROP COLUMN "description",
DROP COLUMN "experienceYears",
DROP COLUMN "isMain",
DROP COLUMN "lastUsedAt",
DROP COLUMN "level";
