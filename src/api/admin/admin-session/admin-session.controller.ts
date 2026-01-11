import { Controller } from '@nestjs/common';
import { AdminSessionService } from './admin-session.service';

@Controller('session')
export class AdminSessionController {
  constructor(private readonly adminSessionService: AdminSessionService) {}
}
