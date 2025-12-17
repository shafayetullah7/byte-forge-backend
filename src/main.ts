import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/modules/logger/app.logger.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(AppLoggerService));

  app.use(cookieParser());

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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log('Application is running on: http://localhost:3000');
  })
  .catch((err) => {
    console.error('Application failed to start', err);
    process.exit(1);
  });
