import { Module } from "@nestjs/common";
import { MailModule } from "@/libs/mail/mail.module";
import { QuizsModule } from "@/quizs/quizs.module";
import { AssignmentsController } from "./assignments.controller";
import { AssignmentsService } from "./assignments.service";

@Module({
  imports: [QuizsModule, MailModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
})
export class AssignmentsModule {}
