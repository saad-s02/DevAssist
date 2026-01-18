import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiSuggestResponse } from "@devassist/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AiAssistService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService
  ) {}

  isEnabled(): boolean {
    return this.config.get("FEATURE_AI_ASSIST") === "true";
  }

  async getSuggestions(ticketId: string): Promise<AiSuggestResponse> {
    // Fetch ticket for context (future: use for real AI)
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Stub: Return mock suggestions
    // In the future, this will call an LLM or vector search
    return {
      suggestions: [
        {
          type: "kb_article",
          id: "kb-stub-1",
          title: "Getting Started with Cline",
          description: "Basic setup and configuration guide",
          relevance: 0.85
        },
        {
          type: "playbook",
          id: "pb-stub-1",
          name: "Debug CI Pipeline",
          description: "Step-by-step guide for CI debugging",
          relevance: 0.72
        },
        {
          type: "action",
          label: "Escalate to Support",
          description: "This ticket may require senior support attention",
          relevance: 0.65
        }
      ],
      generatedAt: new Date().toISOString(),
      model: "stub-v1"
    };
  }
}
