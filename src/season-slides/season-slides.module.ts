import { Module } from '@nestjs/common';
import { SeasonSlidesController } from './season-slides.controller';
import { SeasonSlidesService } from './season-slides.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SeasonSlidesController],
  providers: [SeasonSlidesService],
  exports: [SeasonSlidesService],
})
export class SeasonSlidesModule {}