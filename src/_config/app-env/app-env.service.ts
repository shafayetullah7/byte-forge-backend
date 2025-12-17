import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppEnv } from '../env.schema';

@Injectable()
export class AppEnvService {
  constructor(private readonly configService: ConfigService<AppEnv, true>) {}

  // === Application Settings ===
  get NODE_ENV() {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get PORT() {
    return this.configService.get('PORT', { infer: true });
  }

  get APP_NAME() {
    return this.configService.get('APP_NAME', { infer: true });
  }

  // === Database ===
  get DB_HOST() {
    return this.configService.get('DB_HOST', { infer: true });
  }

  get DB_PORT() {
    return this.configService.get('DB_PORT', { infer: true });
  }

  get DB_USER() {
    return this.configService.get('DB_USER', { infer: true });
  }

  get DB_PASSWORD() {
    return this.configService.get('DB_PASSWORD', { infer: true });
  }

  get DB_NAME() {
    return this.configService.get('DB_NAME', { infer: true });
  }

  get DATABASE_URL() {
    return this.configService.get('DATABASE_URL', { infer: true });
  }

  // === Docker Compose ===
  get COMPOSE_PROJECT_NAME() {
    return this.configService.get('COMPOSE_PROJECT_NAME', { infer: true });
  }

  get APP_EXTERNAL_PORT() {
    return this.configService.get('APP_EXTERNAL_PORT', { infer: true });
  }

  get DB_EXTERNAL_PORT() {
    return this.configService.get('DB_EXTERNAL_PORT', { infer: true });
  }

  get SALT_ROUNDS() {
    return this.configService.get('SALT_ROUNDS', { infer: true });
  }

  // === SMTP ===
  get GMAIL_USER() {
    return this.configService.get('GMAIL_USER', { infer: true });
  }

  get GMAIL_APP_PASSWORD() {
    return this.configService.get('GMAIL_APP_PASSWORD', { infer: true });
  }

  get DEFAULT_FROM_EMAIL() {
    return this.configService.get('DEFAULT_FROM_EMAIL', { infer: true });
  }

  // === Cloudinary ===
  get CLOUDINARY_CLOUD_NAME() {
    return this.configService.get('CLOUDINARY_CLOUD_NAME', { infer: true });
  }

  get CLOUDINARY_API_KEY() {
    return this.configService.get('CLOUDINARY_API_KEY', { infer: true });
  }

  get CLOUDINARY_API_SECRET() {
    return this.configService.get('CLOUDINARY_API_SECRET', { infer: true });
  }
}
