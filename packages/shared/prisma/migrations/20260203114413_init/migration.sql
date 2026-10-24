-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT,
    "avatarUrl" TEXT,
    "accessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installations" (
    "id" TEXT NOT NULL,
    "githubInstallationId" INTEGER NOT NULL,
    "accountLogin" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repos" (
    "id" TEXT NOT NULL,
    "githubRepoId" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "installationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runs" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "prUrl" TEXT NOT NULL,
    "prTitle" TEXT,
    "prHeadSha" TEXT,
    "status" TEXT NOT NULL,
    "summaryMarkdown" TEXT,
    "docsChecklistMarkdown" TEXT,
    "suggestedPatchMarkdown" TEXT,
    "confidence" TEXT,
    "evidence" TEXT[],
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");

-- CreateIndex
CREATE INDEX "users_githubId_idx" ON "users"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "installations_githubInstallationId_key" ON "installations"("githubInstallationId");

-- CreateIndex
CREATE INDEX "installations_githubInstallationId_idx" ON "installations"("githubInstallationId");

-- CreateIndex
CREATE UNIQUE INDEX "repos_githubRepoId_key" ON "repos"("githubRepoId");

-- CreateIndex
CREATE INDEX "repos_githubRepoId_idx" ON "repos"("githubRepoId");

-- CreateIndex
CREATE INDEX "repos_installationId_idx" ON "repos"("installationId");

-- CreateIndex
CREATE INDEX "runs_repoId_idx" ON "runs"("repoId");

-- CreateIndex
CREATE INDEX "runs_prNumber_idx" ON "runs"("prNumber");

-- CreateIndex
CREATE INDEX "runs_createdAt_idx" ON "runs"("createdAt");

-- AddForeignKey
ALTER TABLE "repos" ADD CONSTRAINT "repos_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
