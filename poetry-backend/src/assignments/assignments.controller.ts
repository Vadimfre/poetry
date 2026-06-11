import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { CreateReadingAssignmentDto, UpdateReadingProgressDto } from "./dto/reading-assignment.dto";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { Roles } from "@/auth/roles.decorator";
import { RolesGuard } from "@/auth/roles.guard";
import { AssignmentsService } from "./assignments.service";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { SubmitAssignmentDto } from "./dto/submit-assignment.dto";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post("classrooms/:classroomId/assignments")
  @Roles("TEACHER")
  createAssignment(
    @Param("classroomId") classroomId: string,
    @Req() req: any,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.createAssignment(
      classroomId,
      req.user.id,
      dto,
    );
  }

  @Get("assignments/my")
  @Roles("STUDENT")
  getMyAssignments(@Req() req: any) {
    return this.assignmentsService.getMyAssignments(req.user.id);
  }

  @Get("assignments/:id")
  @Roles("TEACHER", "STUDENT")
  getAssignment(@Param("id") id: string, @Req() req: any) {
    return this.assignmentsService.getAssignment(id, req.user);
  }

  @Get("assignments/:id/results")
  @Roles("TEACHER")
  getResults(@Param("id") id: string, @Req() req: any) {
    return this.assignmentsService.getResults(id, req.user.id);
  }

  @Post("assignments/:id/submit")
  @Roles("STUDENT")
  submitAssignment(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.assignmentsService.submitAssignment(id, req.user, dto);
  }

  @Post("classrooms/:classroomId/reading-assignments")
  @Roles("TEACHER")
  createReadingAssignment(
    @Param("classroomId") classroomId: string,
    @Req() req: any,
    @Body() dto: CreateReadingAssignmentDto,
  ) {
    return this.assignmentsService.createReadingAssignment(
      classroomId,
      req.user.id,
      dto,
    );
  }

  @Get("classrooms/:classroomId/reading-assignments")
  @Roles("TEACHER")
  getClassroomReadingAssignments(
    @Param("classroomId") classroomId: string,
    @Req() req: any,
  ) {
    return this.assignmentsService.getClassroomReadingAssignments(
      classroomId,
      req.user.id,
    );
  }

  @Get("reading-assignments/my")
  @Roles("STUDENT")
  getMyReadingAssignments(@Req() req: any) {
    return this.assignmentsService.getMyReadingAssignments(req.user.id);
  }

  @Patch("reading-assignments/:id/progress")
  @Roles("STUDENT")
  updateReadingProgress(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: UpdateReadingProgressDto,
  ) {
    return this.assignmentsService.updateReadingProgress(
      id,
      req.user.id,
      dto,
    );
  }
}
