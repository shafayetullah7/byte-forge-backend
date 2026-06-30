import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';
import { VerifiedUserAuthGuard } from '@/common/guards/verified-user-auth-guard/verified-user-auth.guard';
import { ResponseService } from '@/common/modules/response/response.service';
import { ApiAuth } from '@/common/decorators/swagger.decorators';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@/common/decorators/api-error.decorator';
import { ShopFollowService } from './shop-follow.service';
import { ShopSlugParamDto } from './dto/shop-slug-param.dto';

@ApiTags('🏪 Buyer - Shop Follow')
@Controller({ path: 'user/buyer/shops', version: '1' })
@UseGuards(VerifiedUserAuthGuard)
export class ShopFollowController {
  constructor(
    private readonly shopFollowService: ShopFollowService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiAuth()
  @ApiOperation({ summary: 'List shops followed by the authenticated buyer' })
  @ApiUnauthorizedResponse()
  @Get('following')
  async listFollowing(
    @AuthenticUser() authUser: TAuthenticUser,
    @I18nLang() lang: string,
  ) {
    const data = await this.shopFollowService.listFollowing(
      authUser.user.id,
      lang,
    );

    return this.responseService.success({
      message: 'Followed shops retrieved successfully',
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Follow a shop' })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse('Cannot follow own shop / shop not verified')
  @Post(':slug/follow')
  async follow(
    @AuthenticUser() authUser: TAuthenticUser,
    @Param() params: ShopSlugParamDto,
  ) {
    const data = await this.shopFollowService.follow(
      authUser.user.id,
      params.slug,
    );

    return this.responseService.success({
      message: 'Shop followed successfully',
      data,
    });
  }

  @ApiAuth()
  @ApiOperation({ summary: 'Unfollow a shop' })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @Delete(':slug/follow')
  async unfollow(
    @AuthenticUser() authUser: TAuthenticUser,
    @Param() params: ShopSlugParamDto,
  ) {
    const data = await this.shopFollowService.unfollow(
      authUser.user.id,
      params.slug,
    );

    return this.responseService.success({
      message: 'Shop unfollowed successfully',
      data,
    });
  }
}
