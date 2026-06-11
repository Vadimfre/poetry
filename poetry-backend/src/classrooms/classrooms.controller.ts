import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { Roles } from "@/auth/roles.decorator";
import { RolesGuard } from "@/auth/roles.guard";
import { ClassroomsService } from "./classrooms.service";
import { CreateClassroomDto } from "./dto/create-classroom.dto";
import { JoinClassroomDto } from "./dto/join-classroom.dto";

@Controller("classrooms")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Post()
  @Roles("TEACHER")
  createClassroom(@Req() req: any, @Body() dto: CreateClassroomDto) {
    return this.classroomsService.createClassroom(req.user.id, dto);
  }

  @Get("my")
  @Roles("TEACHER", "STUDENT")
  getMyClassrooms(@Req() req: any) {
    return this.classroomsService.getMyClassrooms(req.user);
  }

  @Post("join")
  @Roles("STUDENT")
  joinClassroom(@Req() req: any, @Body() dto: JoinClassroomDto) {
    return this.classroomsService.joinClassroom(req.user.id, dto);
  }

  @Get(":id")
  @Roles("TEACHER", "STUDENT")
  getClassroom(@Param("id") id: string, @Req() req: any) {
    return this.classroomsService.getClassroom(id, req.user);
  }
}
