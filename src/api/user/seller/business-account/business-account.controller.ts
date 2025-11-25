import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BusinessAccountService } from './business-account.service';
import { CreateBusinessAccountDto } from './dto/setup.business.dto';
import { TBusinessAccount } from '@/_db/drizzle/schema';
import { UserAuthGuard } from '@/common/guards/user-auth.guard';
import { AuthenticUserParam } from '@/common/pipes/authentic-user.pipe';
import { AuthenticUser } from '@/common/types';

@Controller('business-account')
export class BusinessAccountController {
  constructor(
    private readonly businessAccountService: BusinessAccountService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Post('')
  async createBusinessAccount(
    @Body() body: CreateBusinessAccountDto,
    @AuthenticUserParam() userAuth: AuthenticUser,
  ): Promise<TBusinessAccount> {
    return this.businessAccountService.createBusinessAccount(
      body,
      userAuth.user.id,
    );
  }
}
