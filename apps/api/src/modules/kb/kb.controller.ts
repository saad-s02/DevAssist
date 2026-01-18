import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { KbService } from "./kb.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateKbArticleDto } from "./dto/create-kb-article.dto";
import { UpdateKbArticleDto } from "./dto/update-kb-article.dto";
import { KbQueryDto } from "./dto/kb-query.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("kb")
export class KbController {
  constructor(private readonly kbService: KbService) {}

  @Get()
  async list(@Query() query: KbQueryDto) {
    return this.kbService.listArticles(query);
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    return this.kbService.getArticle(id);
  }

  @Roles("ADMIN", "SUPPORT")
  @Post()
  async create(@Body() dto: CreateKbArticleDto) {
    return this.kbService.createArticle(dto);
  }

  @Roles("ADMIN", "SUPPORT")
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateKbArticleDto) {
    return this.kbService.updateArticle(id, dto);
  }

  @Roles("ADMIN")
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.kbService.deleteArticle(id);
  }
}
