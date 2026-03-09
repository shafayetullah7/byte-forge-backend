import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BusinessAccountService } from './business-account.service';
import { CreateBusinessAccountDto } from './dto/setup.business.dto';
import { TBusinessAccount } from '@/_db/drizzle/schema';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { ResponseService } from '@/common/modules/response/response.service';
import { SuccessResponse } from '@/common/modules/response/dto/success.response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Business Account')
@Controller({ path: 'user/seller/business-account', version: '1' })
export class BusinessAccountController {
  constructor(
    private readonly businessAccountService: BusinessAccountService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a business account' })
  @ApiResponse({ status: 201, description: 'Business account created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(VerifiedUserAuthGuard)
  @Post('')
  async createBusinessAccount(
    @Body() body: CreateBusinessAccountDto,
    @AuthenticUser() userAuth: TAuthenticUser,
  ): Promise<SuccessResponse<TBusinessAccount>> {
    const result = await this.businessAccountService.createBusinessAccount(
      body,
      userAuth.user.id,
    );

    return this.responseService.success({
      data: result,
      message: 'Business account created',
    });
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get business account' })
  @ApiResponse({ status: 200, description: 'Business account retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(VerifiedUserAuthGuard)
  @Get('')
  async getBusiness(
    @AuthenticUser() userAuth: TAuthenticUser,
  ): Promise<SuccessResponse<TBusinessAccount>> {
    const result = await this.businessAccountService.getBusiness(
      userAuth.user.id,
    );

    return this.responseService.success({
      data: result,
      message: 'Business account retrieved',
    });
  }
}
