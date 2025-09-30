import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { FruitGqlModule } from './modules/fruit/fruit.gql.module';
// import { FruitModule } from 'src/api/fruit/fruit.module';

// make crypto global
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.crypto = crypto;

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => ({
        autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
        playground: true,
        context: ({ req, res }: { req: Request; res: Response }) => ({
          req,
          res,
        }),
        buildSchemaOptions: {
          dateScalarMode: 'timestamp',
        },
      }),
    }),
    FruitGqlModule,
    // FruitModule,
  ],
  exports: [NestGraphQLModule],
})
export class GraphqlModule {}
