import {
  Controller,
  Post,
  Param,
  UseGuards,
  NotFoundException
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AiAssistService } from "./ai-assist.service";
import { AiSuggestResponse } from "@devassist/shared";

@Controller("tickets")
@UseGuards(JwtAuthGuard)
export class AiAssistController {
  constructor(private aiAssistService: AiAssistService) {}

  @Post(":id/suggest")
  async suggest(@Param("id") id: string): Promise<AiSuggestResponse> {
    if (!this.aiAssistService.isEnabled()) {
      throw new NotFoundException("AI Assist feature is not enabled");
    }

    return this.aiAssistService.getSuggestions(id);
  }
}
