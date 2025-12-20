import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DrizzleModule } from './_db/drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './_config/configuration';
import { APP_FILTER, APP_PIPE, RouterModule } from '@nestjs/core';
// import { ZodValidationPipe } from './common/pipes/zod.validation.pipe';
import { UserAuthModule } from './api/user/user-auth/user-auth.module';
import { UserModule } from './api/user/user/user.module';
import { HashingModule } from './common/modules/hashing/hashing.module';
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
import { MediaModule } from './api/media/media.module';
import { CloudinaryModule } from './common/modules/cloudinary/cloudinary.module';
import { LoggerModule } from './common/modules/logger/logger.module';

import { AppEnvModule } from './_config/app-env/app-env.module';
import { BusinessAccountModule } from './api/user/seller/business-account/business-account.module';
import { ShopModule } from './api/user/seller/shop/shop.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AdminTreeCategoryModule } from './api/admin/admin-tree-category/admin-tree-category.module';
import { SellerPlantModule } from './api/user/seller/seller-plant/seller-plant.module';
import { UserAuthGuardModule } from './common/guards/user-auth-guard/user-auth-guard.module';
import { AdminAuthGuardModule } from './common/guards/admin-auth-guard/admin-auth-guard.module';
import { RolesGuardModule } from './common/guards/roles-guard/roles-guard.module';
import { AdminLocalAuthGuardModule } from './common/guards/admin-local-auth-guard/admin-local-auth-guard.module';
import { UserLocalAuthGuardModule } from './common/guards/user-local-auth-guard/user-local-auth-guard.module';
import { UserSessionRepositoryModule } from './_repositories/auth/user-session-repository/user-session-repository.module';
import { UserLocalAuthSessionRepositoryModule } from './_repositories/auth/user-local-auth-session-repository/user-local-auth-session-repository.module';

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
    CookieModule,
    ResponseModule,
    TreeCategoriesModule,
    AdminModule,
    AdminAuthModule,
    SessionModule,
    AdminSessionModule,
    AdminTreeCategoryModule,
    EmailModule,
    ConfigModule,
    AppConfigModule,
    GraphqlModule,
    MediaModule,
    CloudinaryModule,
    LoggerModule,
    BusinessAccountModule,
    ShopModule,
    AppEnvModule,
    UserAuthGuardModule,
    AdminAuthGuardModule,
    RolesGuardModule,
    AdminLocalAuthGuardModule,
    UserLocalAuthGuardModule,
    UserSessionRepositoryModule,
    UserLocalAuthSessionRepositoryModule,
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
