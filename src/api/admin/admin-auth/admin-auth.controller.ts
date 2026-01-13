import { Controller } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';

@Controller({ path: 'admin/auth', version: '1' })
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}
}
