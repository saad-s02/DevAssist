import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { TicketsService } from "./tickets.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { UpdateTicketDto } from "./dto/update-ticket.dto";
import { TicketQueryDto } from "./dto/ticket-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuthUser } from "../auth/types/auth-user";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("tickets")
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(user, dto);
  }

  @Get()
  async list(@Query() query: TicketQueryDto) {
    return this.ticketsService.listTickets(query);
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    return this.ticketsService.getTicket(id);
  }

  @Patch(":id")
  async update(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.updateTicket(user, id, dto);
  }

  @Patch(":id/assign")
  @Roles("ADMIN", "SUPPORT")
  async assign(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body("assigneeId") assigneeId?: string) {
    return this.ticketsService.assignTicket(user, id, assigneeId ?? null);
  }
}
