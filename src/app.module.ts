import { Module } from '@nestjs/common';
import { DrizzleModule } from './_db/drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './_config/configuration';
import { APP_FILTER, APP_PIPE, RouterModule } from '@nestjs/core';
// import { ZodValidationPipe } from './common/pipes/zod.validation.pipe';
import { UserAuthModule } from './api/user/user-auth/user-auth.module';
import { UserModule } from './api/user/user/user.module';
import { HashingModule } from './common/modules/hashing/hashing.module';
import { UserSessionModule } from './api/user/user-session/user-session.module';
import { CookieModule } from './common/modules/cookie/cookie.module';
import { ResponseModule } from './common/modules/response/response.module';
import { TreeCategoriesModule } from './api/library/tree-categories/tree-categories.module';
import { AdminModule } from './api/admin/admin/admin.module';
import { AdminAuthModule } from './api/admin/admin-auth/admin-auth.module';
import { SessionModule } from './api/session/session.module';
import { AdminSessionModule } from './api/admin/admin-session/admin-session.module';
import { EmailModule } from './common/modules/email/email.module';
import { AppConfigModule } from './common/modules/app-config/app-config.module';
import { GraphqlModule } from './graphql/graphql.module';
import { AllExceptionsFilter } from './common/exception-filters/all.exception.filter';
import { ZodValidationPipe } from 'nestjs-zod';
import { SellerModule } from './api/user/seller/seller.module';
import { MediaModule } from './api/media/media.module';
import { CloudinaryModule } from './common/modules/cloudinary/cloudinary.module';
import { LoggerModule } from './common/modules/logger/logger.module';

import { AppEnvModule } from './_config/app-env/app-env.module';

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [configuration],
      expandVariables: true,
    }),
    UserAuthModule,
    UserModule,
    HashingModule,
    UserSessionModule,
    CookieModule,
    ResponseModule,
    TreeCategoriesModule,
    AdminModule,
    AdminAuthModule,
    SessionModule,
    AdminSessionModule,
    EmailModule,
    ConfigModule,
    AppConfigModule,
    GraphqlModule,
    SellerModule,
    RouterModule.register([
      {
        path: 'seller',
        module: SellerModule,
      },
    ]),
    MediaModule,
    CloudinaryModule,
    LoggerModule,

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
export class AppModule {}
