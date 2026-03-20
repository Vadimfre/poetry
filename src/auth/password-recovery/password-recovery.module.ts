import { Module } from '@nestjs/common';
import { PasswordRecoveryService } from './password-recovery.service';
import { PasswordRecoveryController } from './password-recovery.controller';
import { MailService } from '@/libs/mail/mail.service';
import { UsersService } from '@/users/users.service';

@Module({
  controllers: [PasswordRecoveryController],
  providers: [PasswordRecoveryService, MailService, UsersService],
})
export class PasswordRecoveryModule {}
