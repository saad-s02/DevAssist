import { Module } from "@nestjs/common";
import { AiAssistController } from "./ai-assist.controller";
import { AiAssistService } from "./ai-assist.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AiAssistController],
  providers: [AiAssistService],
  exports: [AiAssistService]
})
export class AiAssistModule {}
