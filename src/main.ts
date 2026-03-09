import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/modules/logger/app.logger.service';
import { VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppEnvService } from './_config/app-env/app-env.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  app.useLogger(app.get(AppLoggerService));

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.setGlobalPrefix('api');

  app.use(cookieParser());
  process.on('unhandledRejection', (reason, promise) => {
    const logger = app.get(AppLoggerService);
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    const logger = app.get(AppLoggerService);
    logger.error('Uncaught Exception thrown:', error);
    process.exit(1);
  });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3050',
    ],
    credentials: true,
  });

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // strips unknown properties
  //     forbidNonWhitelisted: true, // errors on extra props
  //     transform: true, // transforms to DTO classes
  //   }),
  // );

  const appEnv = app.get(AppEnvService);

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Byte Forge Auth API')
    .setDescription(
      'Authentication, User Management, and Admin API documentation',
    )
    .setVersion('1.0')
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
    .addTag('User Auth', 'User authentication endpoints')
    .addTag('User Profile', 'User profile management')
    .addTag('Password Reset', 'Password reset functionality')
    .addTag('Plants', 'Plant management for sellers')
    .addTag('Shops', 'Shop management for sellers')
    .addTag('Business Account', 'Business account operations')
    .addTag('Admin Auth', 'Admin authentication endpoints')
    .addTag('Admin Session', 'Admin session management')
    .addTag('Categories', 'Category management')
    .addTag('Tags', 'Tag management')
    .addTag('Tag Groups', 'Tag group management')
    .addTag('Languages', 'Language management')
    .addTag('Media', 'Media upload and management')
    .addTag('Tree Categories', 'Public category tree')
    .addTag('Email', 'Email functionality')
    .addTag('Cloudinary', 'Cloudinary integration')
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
