import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { TicketsModule } from "./tickets/tickets.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { KbModule } from "./kb/kb.module";
import { PlaybooksModule } from "./playbooks/playbooks.module";
import { AiAssistModule } from "./ai-assist/ai-assist.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TicketsModule,
    KbModule,
    PlaybooksModule,
    AiAssistModule,
    HealthModule
  ]
})
export class AppModule {}
