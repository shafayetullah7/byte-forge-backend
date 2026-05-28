import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ResponseService } from '@/common/modules/response/response.service';
import { AdminLanguagesService } from './admin-languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { LanguageCodeParamDto } from './dto/language-code-param.dto';
import { AdminAuthGuard } from '@/common/guards/admin-auth-guard/admin-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiAuth } from '@/common/decorators/swagger.decorators';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@/common/decorators/api-error.decorator';

@ApiTags('🌍 Admin - Languages')
@UseGuards(AdminAuthGuard)
@ApiAuth()
@Controller('admin/languages')
export class AdminLanguagesController {
  constructor(
    private readonly languagesService: AdminLanguagesService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOperation({ summary: 'Get all languages' })
  @ApiResponse({ status: 200, description: 'Languages retrieved' })
  @Get()
  async findAll() {
    const data = await this.languagesService.findAll();
    return this.responseService.success({
      data,
      message: 'Languages retrieved successfully',
    });
  }

  @ApiOperation({ summary: 'Create a new language' })
  @ApiResponse({ status: 201, description: 'Language created' })
  @ApiBadRequestResponse()
  @Post()
  async create(@Body() createDto: CreateLanguageDto) {
    const data = await this.languagesService.create(createDto);
    return this.responseService.success({
      data,
      message: 'Language created successfully',
    });
  }

  @ApiOperation({ summary: 'Update a language' })
  @ApiResponse({ status: 200, description: 'Language updated' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse('Language')
  @Patch(':code')
  async update(
    @Param() param: LanguageCodeParamDto,
    @Body() updateDto: UpdateLanguageDto,
  ) {
    const data = await this.languagesService.update(param.code, updateDto);
    return this.responseService.success({
      data,
      message: 'Language updated successfully',
    });
  }
}
