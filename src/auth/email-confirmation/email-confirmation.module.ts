import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EmailConfirmationService } from "./email-confirmation.service";
import { EmailConfirmationController } from "./email-confirmation.controller";
import { MailModule } from "@/libs/mail/mail.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { UsersModule } from "@/users/users.module";

@Module({
  imports: [
    MailModule,
    PrismaModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get("JWT_SECRET") || "poetry-super-secret-jwt-key-2026",
        signOptions: { expiresIn: "7d" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EmailConfirmationController],
  providers: [EmailConfirmationService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}

