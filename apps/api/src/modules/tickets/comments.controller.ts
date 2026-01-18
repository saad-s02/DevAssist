import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthUser } from "../auth/types/auth-user";
import { CreateCommentDto } from "./dto/create-comment.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("tickets/:ticketId/comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async add(@CurrentUser() user: AuthUser, @Param("ticketId") ticketId: string, @Body() dto: CreateCommentDto) {
    return this.commentsService.addComment(user, ticketId, dto);
  }

  @Get()
  async list(@Param("ticketId") ticketId: string) {
    return this.commentsService.listComments(ticketId);
  }
}
