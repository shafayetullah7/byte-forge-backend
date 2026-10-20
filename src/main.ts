import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLoggerService } from './libs/modules/logger/app.logger.service';
import { VersioningType } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import cookieParser = require('cookie-parser');
import { AppEnvService } from './_config/app-env/app-env.service';
import { AppConfigService } from './libs/modules/app-config/app-config.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
function logOidcContract(
  logger: AppLoggerService,
  appConfig: AppConfigService,
): void {
  const cookieDomain = appConfig.cookieDomain?.trim() || '(unset)';
  logger.log(
    [
      'OIDC contract:',
      `issuer=${appConfig.oidcIssuer}`,
      `internalIssuer=${appConfig.oidcInternalIssuer}`,
      `clientId=${appConfig.oidcClientId}`,
      `redirectUri=${appConfig.oidcRedirectUri}`,
      `resource=${appConfig.oidcDefaultResource}`,
      `postLogoutRedirectUri=${appConfig.oidcPostLogoutRedirectUri}`,
      `frontendUrl=${appConfig.frontendUrl}`,
      `cookieDomain=${cookieDomain}`,
      `allowedOrigins=${appConfig.allowedOrigins.join(',')}`,
    ].join(' '),
  );

  if (
    appConfig.nodeEnv === 'development' &&
    !appConfig.cookieDomain?.trim()
  ) {
    logger.warn(
      'COOKIE_DOMAIN is empty — bfAccessToken / bf-xsrf-token will be host-only on :3005; storefront SSR and federated logout CSRF will break across :3000 ↔ :3005. Set COOKIE_DOMAIN=localhost for local OIDC.',
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
    rawBody: true,
  });
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.setGlobalPrefix('api', { exclude: ['health'] });

  app.use(cookieParser());

  const appEnv = app.get(AppEnvService);
  const appConfig = app.get(AppConfigService);
  logOidcContract(logger, appConfig);

  process.on('unhandledRejection', (reason, promise) => {
    const logger = app.get(AppLoggerService);
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (reason instanceof Error) {
      logger.error('Stack trace:', reason.stack);
    }
  });

  process.on('uncaughtException', (error) => {
    const logger = app.get(AppLoggerService);
    logger.error('Uncaught Exception thrown:', error);
    if (error instanceof Error) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  });

  app.enableCors({
    origin: appConfig.allowedOrigins,
    credentials: true,
  });

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // strips unknown properties
  //     forbidNonWhitelisted: true, // errors on extra props
  //     transform: true, // transforms to DTO classes
  //   }),
  // );

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ByteForge E-Commerce API')
    .setDescription(
      `
## About ByteForge API

A comprehensive e-commerce platform API for buying and selling plants online.

### Features
- 🏪 Multi-vendor shop management
- 🌱 Plant catalog with variants
- 📦 Order management (coming soon)
- 🏷️ Taxonomy & categorization
- 📱 Media management

### Authentication

All protected endpoints require JWT authentication via Bearer token.

### Rate Limits
- Standard endpoints: 100 requests/minute
- Bulk operations: 10 requests/minute

### Error Handling

All errors follow a standard format:

\`\`\`json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ],
  "timestamp": "2026-03-11T10:00:00Z"
}
\`\`\`
`,
    )
    .setVersion('1.0')
    .addServer('http://localhost:3000/api', 'Local Development')
    .setContact(
      'ByteForge API Support',
      'https://byteforge.com/support',
      'api-support@byteforge.com',
    )
    .setLicense('Proprietary', 'https://byteforge.com/license')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag(
      '🚀 Getting Started',
      'API overview, authentication, and error handling',
    )
    .addTag(
      '👤 User Auth',
      'User registration, login, logout, OTP verification',
    )
    .addTag('👤 User Profile', 'Get and update user profile')
    .addTag(
      '🔐 Password Reset',
      'Request password reset, verify OTP, set new password',
    )
    .addTag(
      '🏪 Seller - Shop Setup',
      'Apply for seller, manage shop details and branding',
    )
    .addTag('🌱 Seller - Plant Catalog', 'Create, read, update, delete plants')
    .addTag('📁 Media', 'Upload, delete, and manage media files')
    .addTag('🔐 Admin Auth', 'Admin login, refresh token, logout')
    .addTag(
      '🏪 Admin - Shop Management',
      'Verify, suspend, deactivate, reactivate shops',
    )
    .addTag('🏷️ Admin - Taxonomy', 'Manage categories, tags, and tag groups')
    .addTag('🌍 Admin - Languages', 'Manage supported languages')
    .addTag('🏪 Public - Shops', 'Browse shops without authentication')
    .addTag('📂 Public - Categories', 'Browse category tree and details')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, swaggerDocument);

  await app.listen(appEnv.APP_EXTERNAL_PORT);
}
bootstrap()
  .then(() => {
    // We can't access appEnv here easily without returning app from bootstrap,
    // but we can trust the port was set correctly or just log generic success.
    // Or better, let's just log "Application started".
    // Alternatively, we can rely on Nest's internal logger which logs the port.
    console.log('Application started');
  })
  .catch((err) => {
    console.error('Application failed to start', err);
    process.exit(1);
  });
