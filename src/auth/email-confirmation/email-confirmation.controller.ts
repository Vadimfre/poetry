import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  ValidationPipe,
} from "@nestjs/common";
import { EmailConfirmationService } from "./email-confirmation.service";
import { Request, Response } from "express";
import { ConfirmationDto } from "./dto/confirmation.dto";

@Controller("auth/email-confirmation")
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  public async newVerification(
    @Req() req: Request,
    @Body(ValidationPipe) dto: ConfirmationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.emailConfirmationService.newVerification(req, dto);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return {
      success: true,
      message: result.message,
      user: result.user,
    };
  }
}
