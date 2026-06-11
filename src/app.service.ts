import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Poetry Backend API v1.0 🎭📚';
  }
}
