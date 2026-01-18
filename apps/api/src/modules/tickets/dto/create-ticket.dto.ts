import { IsIn, IsString, MinLength } from "class-validator";
import { TicketComponent, TicketSeverity } from "@devassist/shared";

const severityValues: TicketSeverity[] = ["P0", "P1", "P2", "P3"];
const componentValues: TicketComponent[] = ["CLINE", "COPILOT", "RAG", "CI", "EXTENSION", "OTHER"];

export class CreateTicketDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsIn(severityValues)
  severity!: TicketSeverity;

  @IsIn(componentValues)
  component!: TicketComponent;
}
