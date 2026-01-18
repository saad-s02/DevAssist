import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthUser } from "../auth/types/auth-user";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { TicketQueryDto } from "./dto/ticket-query.dto";

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(user: AuthUser, dto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        severity: dto.severity,
        component: dto.component,
        requesterId: user.id
      }
    });

    return this.toTicketDto(ticket);
  }

  async listTickets(dto: TicketQueryDto) {
    const orFilters = dto.query
      ? [
          { title: { contains: dto.query } },
          { description: { contains: dto.query } }
        ]
      : undefined;

    const where: any = {
      status: dto.status,
      severity: dto.severity,
      component: dto.component,
      OR: orFilters
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({ where, orderBy: { createdAt: "desc" } }),
      this.prisma.ticket.count({ where })
    ]);

    return { items: items.map((ticket: { [key: string]: any }) => this.toTicketDto(ticket)), total };
  }

  async getTicket(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { comments: true }
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    return {
      ticket: this.toTicketDto(ticket),
      comments: ticket.comments.map((comment: { [key: string]: any }) => this.toCommentDto(comment))
    };
  }

  async updateTicket(user: AuthUser, id: string, dto: UpdateTicketDto) {
    const existing = await this.prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Ticket not found");
    }

    const canEdit = user.role === "ADMIN" || user.role === "SUPPORT" || existing.requesterId === user.id;
    if (!canEdit) {
      throw new ForbiddenException("Not authorized to update this ticket");
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        severity: dto.severity,
        component: dto.component,
        assigneeId: dto.assigneeId ?? undefined,
        slaDueAt: dto.slaDueAt ? new Date(dto.slaDueAt) : undefined
      }
    });

    return this.toTicketDto(updated);
  }

  async assignTicket(user: AuthUser, id: string, assigneeId: string | null) {
    if (user.role === "ENGINEER") {
      throw new ForbiddenException("Not authorized to assign tickets");
    }
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { assigneeId: assigneeId ?? null }
    });
    return this.toTicketDto(ticket);
  }

  private toTicketDto(ticket: { [key: string]: any }) {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      severity: ticket.severity,
      component: ticket.component,
      assigneeId: ticket.assigneeId,
      requesterId: ticket.requesterId,
      slaDueAt: ticket.slaDueAt ? ticket.slaDueAt.toISOString() : null,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString()
    };
  }

  private toCommentDto(comment: { [key: string]: any }) {
    return {
      id: comment.id,
      ticketId: comment.ticketId,
      authorId: comment.authorId,
      body: comment.body,
      createdAt: comment.createdAt.toISOString()
    };
  }
}
