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

  get FRONTEND_URL() {
    return this.configService.get('FRONTEND_URL', { infer: true });
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

  get DB_SSL() {
    return this.configService.get('DB_SSL', { infer: true });
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

  get DOCKER_BUILD_TARGET() {
    return this.configService.get('DOCKER_BUILD_TARGET', { infer: true });
  }

  get SALT_ROUNDS() {
    return this.configService.get('SALT_ROUNDS', { infer: true });
  }

  // === Observability ===
  get PROMETHEUS_EXTERNAL_PORT() {
    return this.configService.get('PROMETHEUS_EXTERNAL_PORT', { infer: true });
  }

  get GRAFANA_EXTERNAL_PORT() {
    return this.configService.get('GRAFANA_EXTERNAL_PORT', { infer: true });
  }

  get GRAFANA_ADMIN_USER() {
    return this.configService.get('GRAFANA_ADMIN_USER', { infer: true });
  }

  get GRAFANA_ADMIN_PASSWORD() {
    return this.configService.get('GRAFANA_ADMIN_PASSWORD', { infer: true });
  }

  // === Email / SMTP ===
  get MAIL_PROVIDER() {
    return this.configService.get('MAIL_PROVIDER', { infer: true });
  }

  get MAIL_HOST() {
    return this.configService.get('MAIL_HOST', { infer: true });
  }

  get MAIL_PORT() {
    return this.configService.get('MAIL_PORT', { infer: true });
  }

  get MAIL_SECURE() {
    return this.configService.get('MAIL_SECURE', { infer: true });
  }

  get MAIL_USER() {
    return this.configService.get('MAIL_USER', { infer: true });
  }

  get MAIL_PASSWORD() {
    return this.configService.get('MAIL_PASSWORD', { infer: true });
  }

  get MAIL_FROM_NAME() {
    return this.configService.get('MAIL_FROM_NAME', { infer: true });
  }

  get MAIL_FROM_EMAIL() {
    return this.configService.get('MAIL_FROM_EMAIL', { infer: true });
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

  // === JWT Secrets ===
  get JWT_SECRET_RESET_REQUEST() {
    return this.configService.get('JWT_SECRET_RESET_REQUEST', { infer: true });
  }

  get JWT_SECRET_RESET_ACCESS() {
    return this.configService.get('JWT_SECRET_RESET_ACCESS', { infer: true });
  }

  // === Session & Cookie ===
  get SESSION_MAX_AGE() {
    return this.configService.get('SESSION_MAX_AGE', { infer: true });
  }

  get COOKIE_DOMAIN() {
    return this.configService.get('COOKIE_DOMAIN', { infer: true });
  }

  // === Admin JWT ===
  get JWT_ADMIN_ACCESS_SECRET() {
    return this.configService.get('JWT_ADMIN_ACCESS_SECRET', { infer: true });
  }

  get JWT_ADMIN_ACCESS_EXP() {
    return this.configService.get('JWT_ADMIN_ACCESS_EXP', { infer: true });
  }

  get JWT_ADMIN_REFRESH_SECRET() {
    return this.configService.get('JWT_ADMIN_REFRESH_SECRET', { infer: true });
  }

  get JWT_ADMIN_REFRESH_EXP() {
    return this.configService.get('JWT_ADMIN_REFRESH_EXP', { infer: true });
  }

  // === User JWT ===
  get JWT_USER_ACCESS_SECRET() {
    return this.configService.get('JWT_USER_ACCESS_SECRET', { infer: true });
  }

  get JWT_USER_ACCESS_EXP() {
    return this.configService.get('JWT_USER_ACCESS_EXP', { infer: true });
  }

  get JWT_USER_REFRESH_SECRET() {
    return this.configService.get('JWT_USER_REFRESH_SECRET', { infer: true });
  }

  get JWT_USER_REFRESH_EXP() {
    return this.configService.get('JWT_USER_REFRESH_EXP', { infer: true });
  }
}
