import { Injectable, ExecutionContext } from "@nestjs/common";
import { ViewsService } from "../views.service";

@Injectable()
export class IpExtractionGuard {
  constructor(private viewsService: ViewsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Извлекаем IP и добавляем в request
    request.extractedIp = this.viewsService.extractIp(request);

    return true;
  }
}
