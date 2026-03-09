import { Controller } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Cloudinary')
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
}
