import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateKbArticleDto } from "./dto/create-kb-article.dto";
import { UpdateKbArticleDto } from "./dto/update-kb-article.dto";
import { KbQueryDto } from "./dto/kb-query.dto";

@Injectable()
export class KbService {
  constructor(private readonly prisma: PrismaService) {}

  async listArticles(query: KbQueryDto) {
    const where: any = {
      AND: [] as any[]
    };

    if (query.query) {
      where.AND.push({
        OR: [
          { title: { contains: query.query } },
          { body: { contains: query.query } }
        ]
      });
    }

    if (query.tag) {
      where.AND.push({ tags: { has: query.tag } });
    }

    if (where.AND.length === 0) {
      delete where.AND;
    }

    const items = await this.prisma.kbArticle.findMany({
      where,
      orderBy: { updatedAt: "desc" }
    });

    return items.map((article: { [key: string]: any }) => this.toDto(article));
  }

  async getArticle(id: string) {
    const article = await this.prisma.kbArticle.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException("Article not found");
    }
    return this.toDto(article);
  }

  async createArticle(dto: CreateKbArticleDto) {
    const article = await this.prisma.kbArticle.create({
      data: {
        title: dto.title,
        body: dto.body,
        tags: dto.tags
      }
    });

    return this.toDto(article);
  }

  async updateArticle(id: string, dto: UpdateKbArticleDto) {
    const existing = await this.prisma.kbArticle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Article not found");
    }

    const article = await this.prisma.kbArticle.update({
      where: { id },
      data: {
        title: dto.title,
        body: dto.body,
        tags: dto.tags
      }
    });

    return this.toDto(article);
  }

  async deleteArticle(id: string) {
    const existing = await this.prisma.kbArticle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Article not found");
    }

    await this.prisma.kbArticle.delete({ where: { id } });
    return { id };
  }

  private toDto(article: { [key: string]: any }) {
    return {
      id: article.id,
      title: article.title,
      body: article.body,
      tags: article.tags,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    };
  }
}
