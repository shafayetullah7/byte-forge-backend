import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressIdParamsDto } from './dto/address-params.dto';
import { AddressPaginationDto } from './dto/list-addresses-query.dto';
import { AddressResponseDto } from './response/address-response.dto';
import { ResponseService } from '@/common/modules/response/response.service';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { ApiAuth, ApiOkResponseTyped, ApiCreatedResponseTyped, ApiPaginatedResponse } from '@/common/decorators/swagger.decorators';
import { ApiBadRequestResponse, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@/common/decorators/api-error.decorator';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { UserAuthGuard } from '@/common/guards/user-auth-guard/user-auth.guard';

@ApiTags('📍 User Addresses')
@Controller({ path: 'user/buyer/addresses', version: '1' })
@UseGuards(UserAuthGuard)
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    private readonly responseService: ResponseService,
    private readonly i18n: I18nService,
  ) {}

  @ApiAuth()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiCreatedResponseTyped(AddressResponseDto, 'Address created successfully')
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @Post()
  async create(
    @AuthenticUser() authUser: TAuthenticUser,
    @Body() dto: CreateAddressDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.addressesService.create(authUser.user.id, dto, lang);
    const response = this.responseService.success({
      message: this.i18n.t('message.success.addressCreated', { lang }),
      data: result,
    });
    return response;
  }

  @ApiAuth()
  @ApiOperation({ summary: 'List all addresses' })
  @ApiPaginatedResponse(AddressResponseDto)
  @ApiUnauthorizedResponse()
  @Get()
  async findAll(
    @AuthenticUser() authUser: TAuthenticUser,
    @Query() query: AddressPaginationDto,
    @I18nLang() lang: string,
  ) {
    console.log('[GET /addresses] params:', JSON.stringify(query, null, 2));
    const { addresses, total } = await this.addressesService.findAll(
      authUser.user.id,
      lang,
      query,
    );
    console.log('[GET /addresses] total:', total, 'data:', JSON.stringify(addresses, null, 2));
    return this.responseService.paginated({
      message: this.i18n.t('message.success.addressesRetrieved', { lang }),
      data: addresses,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiOkResponseTyped(AddressResponseDto, 'Address retrieved successfully')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Address')
  @Get(':id')
  async findById(
    @Param() params: AddressIdParamsDto,
    @AuthenticUser() authUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const result = await this.addressesService.findById(params.id, authUser.user.id, lang);
    return this.responseService.success({
      message: this.i18n.t('message.success.addressRetrieved', { lang }),
      data: result,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Update an address' })
  @ApiOkResponseTyped(AddressResponseDto, 'Address updated successfully')
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Address')
  @Patch(':id')
  async update(
    @Param() params: AddressIdParamsDto,
    @AuthenticUser() authUser: TAuthenticUser,
    @Body() dto: UpdateAddressDto,
    @I18nLang() lang: string,
  ) {
    const result = await this.addressesService.update(
      params.id,
      authUser.user.id,
      dto,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.addressUpdated', { lang }),
      data: result,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Delete an address' })
  @ApiOkResponse({ description: 'Address deleted successfully' })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Address')
  @Delete(':id')
  async delete(
    @Param() params: AddressIdParamsDto,
    @AuthenticUser() authUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    await this.addressesService.delete(params.id, authUser.user.id);
    return this.responseService.success({
      message: this.i18n.t('message.success.addressDeleted', { lang }),
      data: {},
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Set address as default' })
  @ApiOkResponseTyped(AddressResponseDto, 'Default address set successfully')
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Address')
  @Patch(':id/default')
  async setDefault(
    @Param() params: AddressIdParamsDto,
    @AuthenticUser() authUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const result = await this.addressesService.setDefault(
      params.id,
      authUser.user.id,
      lang,
    );
    return this.responseService.success({
      message: this.i18n.t('message.success.addressSetDefault', { lang }),
      data: result,
    });
  }
}
