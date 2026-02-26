import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ResponseService } from '@/common/modules/response/response.service';
import { AdminLanguagesService } from './admin-languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Controller('admin/languages')
export class AdminLanguagesController {
  constructor(
    private readonly languagesService: AdminLanguagesService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  async findAll() {
    const data = await this.languagesService.findAll();
    return this.responseService.success({ data, message: 'Languages retrieved successfully' });
  }

  @Post()
  async create(@Body() createDto: CreateLanguageDto) {
    const data = await this.languagesService.create(createDto);
    return this.responseService.success({ data, message: 'Language created successfully' });
  }

  @Patch(':code')
  async update(@Param('code') code: string, @Body() updateDto: UpdateLanguageDto) {
    const data = await this.languagesService.update(code, updateDto);
    return this.responseService.success({ data, message: 'Language updated successfully' });
  }
}
