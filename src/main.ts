import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/modules/logger/app.logger.service';
import { VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppEnvService } from './_config/app-env/app-env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // only show errors and warnings during initialization
  });
  app.useLogger(app.get(AppLoggerService));

  // Enable URI versioning (e.g., /api/v1/users, /api/v2/users)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // Default version if not specified
  });

  // Set global API prefix (without version)
  app.setGlobalPrefix('api');

  app.use(cookieParser());

  // Handle global unhandled rejections/exceptions
  process.on('unhandledRejection', (reason, promise) => {
    const logger = app.get(AppLoggerService);
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    const logger = app.get(AppLoggerService);
    logger.error('Uncaught Exception thrown:', error);
    process.exit(1);
  });

  // CORS for development
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3050'],
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
  await app.listen(appEnv.APP_EXTERNAL_PORT);
}
bootstrap()
  .then(() => {
    // We can't access appEnv here easily without returning app from bootstrap, 
    // but we can trust the port was set correctly or just log generic success.
    // Or better, let's just log "Application started".
    // Alternatively, we can rely on Nest's internal logger which logs the port.
    console.log(`Application started`);
  })
  .catch((err) => {
    console.error('Application failed to start', err);
    process.exit(1);
  });
