import { Controller, Get } from '@nestjs/common';
import { SeasonSlidesService } from './season-slides.service';
import { SeasonSlideDto } from './dto/season-slide.dto';

@Controller('season-slides')
export class SeasonSlidesController {
  constructor(private readonly seasonSlidesService: SeasonSlidesService) {}

  @Get()
  async findAllActive(): Promise<SeasonSlideDto[]> {
    return this.seasonSlidesService.findAllActive();
  }
}