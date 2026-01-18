import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthUser } from "../auth/types/auth-user";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async addComment(user: AuthUser, ticketId: string, dto: CreateCommentDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    const canComment = user.role === "ADMIN" || user.role === "SUPPORT" || ticket.requesterId === user.id;
    if (!canComment) {
      throw new ForbiddenException("Not authorized to comment");
    }

    const comment = await this.prisma.comment.create({
      data: {
        ticketId,
        authorId: user.id,
        body: dto.body
      }
    });

    return {
      id: comment.id,
      ticketId: comment.ticketId,
      authorId: comment.authorId,
      body: comment.body,
      createdAt: comment.createdAt.toISOString()
    };
  }

  async listComments(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }
    const items = await this.prisma.comment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" }
    });

    return items.map((comment: { [key: string]: any }) => ({
      id: comment.id,
      ticketId: comment.ticketId,
      authorId: comment.authorId,
      body: comment.body,
      createdAt: comment.createdAt.toISOString()
    }));
  }
}
