import { Module } from "@nestjs/common";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";

@Module({
  controllers: [TicketsController, CommentsController],
  providers: [TicketsService, CommentsService]
})
export class TicketsModule {}
