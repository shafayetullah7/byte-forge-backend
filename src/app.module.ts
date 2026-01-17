import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DrizzleModule } from './_db/drizzle/drizzle.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';
import configuration from './_config/configuration';
import { envSchema } from './_config/env.schema';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
// import { ZodValidationPipe } from './common/pipes/zod.validation.pipe';
import { UserApiModule } from './api/user/user-api.module';
import { HashingModule } from './common/modules/hashing/hashing.module';
import { CookieModule } from './common/modules/cookie/cookie.module';
import { ResponseModule } from './common/modules/response/response.module';
import { TreeCategoriesModule } from './api/library/tree-categories/tree-categories.module';
import { AdminApiModule } from './api/admin/admin-api.module';

import { EmailModule } from './common/modules/email/email.module';
import { AppConfigModule } from './common/modules/app-config/app-config.module';
import { GraphqlModule } from './graphql/graphql.module';
import { AllExceptionsFilter } from './common/exception-filters/all.exception.filter';
import { ZodValidationPipe } from 'nestjs-zod';
import { MediaModule } from './api/media/media.module';
import { CloudinaryModule } from './common/modules/cloudinary/cloudinary.module';
import { LoggerModule } from './common/modules/logger/logger.module';
import { UserAuthGuardModule } from './common/guards/user-auth-guard/user-auth-guard.module';
import { VerifiedUserAuthGuardModule } from './common/guards/verified-user-auth-guard/verified-user-auth.guard.module';

import { AppEnvModule } from './_config/app-env/app-env.module';

import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    DrizzleModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      load: [configuration],
      validate: (config) => envSchema.parse(config),
      expandVariables: true,
    }),
    UserApiModule,
    AdminApiModule,
    TreeCategoriesModule,
    MediaModule,
    HashingModule,
    CookieModule,
    ResponseModule,
    EmailModule,
    AppConfigModule,
    GraphqlModule,
    CloudinaryModule,
    LoggerModule,
    UserAuthGuardModule,
    VerifiedUserAuthGuardModule,
    AppEnvModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
    // {
    //   provide: APP_FILTER,
    //   useClass: ZodExceptionFilter,
    // },
    // {
    //   provide: APP_FILTER,
    //   useClass: DrizzleExceptionFilter,
    // },
    // {
    //   provide: APP_FILTER,
    //   useClass: GqlExceptionFilter,
    // },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
