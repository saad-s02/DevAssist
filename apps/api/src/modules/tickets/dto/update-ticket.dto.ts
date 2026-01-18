import { IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { TicketComponent, TicketSeverity, TicketStatus } from "@devassist/shared";

const statusValues: TicketStatus[] = ["OPEN", "IN_PROGRESS", "BLOCKED", "RESOLVED"];
const severityValues: TicketSeverity[] = ["P0", "P1", "P2", "P3"];
const componentValues: TicketComponent[] = ["CLINE", "COPILOT", "RAG", "CI", "EXTENSION", "OTHER"];

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsIn(statusValues)
  status?: TicketStatus;

  @IsOptional()
  @IsIn(severityValues)
  severity?: TicketSeverity;

  @IsOptional()
  @IsIn(componentValues)
  component?: TicketComponent;

  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  @IsOptional()
  @IsString()
  slaDueAt?: string | null;
}
