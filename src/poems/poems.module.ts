import { Module } from '@nestjs/common';
import { PoemsService } from './poems.service';
import { PoemsController } from './poems.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PoemsService],
  controllers: [PoemsController],
  exports: [PoemsService],
})
export class PoemsModule {}
