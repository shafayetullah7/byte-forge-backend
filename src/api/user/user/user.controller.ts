import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { UserAuthGuard } from '@/common/guards/user-auth-guard/user-auth.guard';
import { AuthenticUser } from '@/common/decorators/authentic-user.decorator';
import { TAuthenticUser } from '@/common/types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(UserAuthGuard)
  @Get()
  async getUser(@AuthenticUser() userAuth: TAuthenticUser) {
    const { user } = userAuth;

    const result = await this.userService.getUser(user.id);

    return { success: true, message: 'User retrieved', data: result.user };
  }
}
