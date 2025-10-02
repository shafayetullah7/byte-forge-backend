// src/common/decorators/use-zod.pipe.ts
import { UsePipes } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { ZodGQLValidationPipe } from '../pipes/zod.gql.validation.pipe';

export const UseZodGQL = (schema: ZodSchema<any>) =>
  UsePipes(new ZodGQLValidationPipe(schema));
