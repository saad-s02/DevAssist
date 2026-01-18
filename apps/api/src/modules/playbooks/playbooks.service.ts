import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaybookDto } from './dto/create-playbook.dto';
import { UpdatePlaybookDto } from './dto/update-playbook.dto';
import { PlaybookQueryDto } from './dto/playbook-query.dto';

@Injectable()
export class PlaybooksService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlaybooks(query: PlaybookQueryDto) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { tags: { has: query.search } },
      ];
    }

    const items = await this.prisma.playbook.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return items.map((playbook: { [key: string]: any }) => this.toDto(playbook));
  }

  async getPlaybook(id: string) {
    const playbook = await this.prisma.playbook.findUnique({ where: { id } });
    if (!playbook) {
      throw new NotFoundException('Playbook not found');
    }
    return this.toDto(playbook);
  }

  async createPlaybook(dto: CreatePlaybookDto) {
    const playbook = await this.prisma.playbook.create({
      data: {
        name: dto.name,
        description: dto.description,
        template: dto.template,
        tags: dto.tags ?? [],
      },
    });

    return this.toDto(playbook);
  }

  async updatePlaybook(id: string, dto: UpdatePlaybookDto) {
    const existing = await this.prisma.playbook.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Playbook not found');
    }

    const playbook = await this.prisma.playbook.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        template: dto.template,
        tags: dto.tags,
      },
    });

    return this.toDto(playbook);
  }

  async deletePlaybook(id: string) {
    const existing = await this.prisma.playbook.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Playbook not found');
    }

    await this.prisma.playbook.delete({ where: { id } });
    return { id };
  }

  private toDto(playbook: { [key: string]: any }) {
    return {
      id: playbook.id,
      name: playbook.name,
      description: playbook.description,
      template: playbook.template,
      tags: playbook.tags,
      createdAt: playbook.createdAt.toISOString(),
      updatedAt: playbook.updatedAt.toISOString(),
    };
  }
}
