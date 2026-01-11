import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/modules/logger/app.logger.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // only show errors and warnings during initialization
  });
  app.useLogger(app.get(AppLoggerService));

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
    origin: 'http://localhost:3001',
    credentials: true,
  });

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true, // strips unknown properties
  //     forbidNonWhitelisted: true, // errors on extra props
  //     transform: true, // transforms to DTO classes
  //   }),
  // );

  await app.listen(process.env.APP_EXTERNAL_PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log(
      `Application is running on: http://localhost:${process.env.APP_EXTERNAL_PORT}`,
    );
  })
  .catch((err) => {
    console.error('Application failed to start', err);
    process.exit(1);
  });
