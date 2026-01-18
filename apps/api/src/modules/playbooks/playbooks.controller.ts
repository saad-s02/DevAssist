import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PlaybooksService } from './playbooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePlaybookDto } from './dto/create-playbook.dto';
import { UpdatePlaybookDto } from './dto/update-playbook.dto';
import { PlaybookQueryDto } from './dto/playbook-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('playbooks')
export class PlaybooksController {
  constructor(private readonly playbooksService: PlaybooksService) {}

  @Get()
  async list(@Query() query: PlaybookQueryDto) {
    return this.playbooksService.listPlaybooks(query);
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.playbooksService.getPlaybook(id);
  }

  @Roles('ADMIN', 'SUPPORT')
  @Post()
  async create(@Body() dto: CreatePlaybookDto) {
    return this.playbooksService.createPlaybook(dto);
  }

  @Roles('ADMIN', 'SUPPORT')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePlaybookDto) {
    return this.playbooksService.updatePlaybook(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.playbooksService.deletePlaybook(id);
  }
}
