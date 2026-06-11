import { Module } from "@nestjs/common";
import { ProseController } from "./prose.controller";
import { ProseService } from "./prose.service";

@Module({
  controllers: [ProseController],
  providers: [ProseService],
  exports: [ProseService],
})
export class ProseModule {}
