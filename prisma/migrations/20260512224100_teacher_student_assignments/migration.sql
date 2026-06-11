-- Add teacher/student roles for classroom assignments.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STUDENT';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TEACHER';

CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "AttemptStatus" AS ENUM ('SUBMITTED');

CREATE TABLE "Classroom" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "teacherId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClassroomMember" (
  "id" TEXT NOT NULL,
  "classroomId" TEXT NOT NULL,
  "studentId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ClassroomMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizAssignment" (
  "id" TEXT NOT NULL,
  "classroomId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3),
  "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "sendEmailResults" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "QuizAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizAssignmentItem" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "quizId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "QuizAssignmentItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizAttempt" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "studentId" INTEGER NOT NULL,
  "total" INTEGER NOT NULL,
  "correct" INTEGER NOT NULL,
  "percentage" INTEGER NOT NULL,
  "grade" INTEGER NOT NULL,
  "status" "AttemptStatus" NOT NULL DEFAULT 'SUBMITTED',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizAttemptAnswer" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "zoneId" TEXT,
  "order" INTEGER,
  "content" TEXT,
  "isCorrect" BOOLEAN,

  CONSTRAINT "QuizAttemptAnswer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Classroom_code_key" ON "Classroom"("code");
CREATE INDEX "Classroom_teacherId_idx" ON "Classroom"("teacherId");
CREATE UNIQUE INDEX "ClassroomMember_classroomId_studentId_key" ON "ClassroomMember"("classroomId", "studentId");
CREATE INDEX "ClassroomMember_studentId_idx" ON "ClassroomMember"("studentId");
CREATE INDEX "QuizAssignment_classroomId_idx" ON "QuizAssignment"("classroomId");
CREATE INDEX "QuizAssignment_status_idx" ON "QuizAssignment"("status");
CREATE UNIQUE INDEX "QuizAssignmentItem_assignmentId_quizId_key" ON "QuizAssignmentItem"("assignmentId", "quizId");
CREATE INDEX "QuizAssignmentItem_quizId_idx" ON "QuizAssignmentItem"("quizId");
CREATE UNIQUE INDEX "QuizAttempt_assignmentId_studentId_key" ON "QuizAttempt"("assignmentId", "studentId");
CREATE INDEX "QuizAttempt_studentId_idx" ON "QuizAttempt"("studentId");
CREATE INDEX "QuizAttemptAnswer_attemptId_idx" ON "QuizAttemptAnswer"("attemptId");
CREATE INDEX "QuizAttemptAnswer_questionId_idx" ON "QuizAttemptAnswer"("questionId");

ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassroomMember" ADD CONSTRAINT "ClassroomMember_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassroomMember" ADD CONSTRAINT "ClassroomMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAssignment" ADD CONSTRAINT "QuizAssignment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAssignmentItem" ADD CONSTRAINT "QuizAssignmentItem_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "QuizAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAssignmentItem" ADD CONSTRAINT "QuizAssignmentItem_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "QuizAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAttemptAnswer" ADD CONSTRAINT "QuizAttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
