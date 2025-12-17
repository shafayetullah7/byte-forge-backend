import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BusinessAccountService } from './business-account.service';
import { CreateBusinessAccountDto } from './dto/setup.business.dto';
import { TBusinessAccount } from '@/_db/drizzle/schema';
import { UserAuthGuard } from '@/common/guards/user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { ResponseService } from '@/common/modules/response/response.service';
import { SuccessResponse } from '@/common/modules/response/dto/success.response.dto';

@Controller('user/seller/business-account')
export class BusinessAccountController {
  constructor(
    private readonly businessAccountService: BusinessAccountService,
    private readonly responseService: ResponseService,
  ) {}

  @UseGuards(UserAuthGuard)
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

  @UseGuards(UserAuthGuard)
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
