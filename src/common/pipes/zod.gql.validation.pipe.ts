/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/common/pipes/zod-validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodGQLValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
    return this.schema.parse(value ?? {}); // handle undefined automatically

    // try {
    //   return this.schema.parse(value ?? {}); // handle undefined automatically
    // } catch (error) {
    //   throw new BadRequestException(error.errors);
    // }
  }
}
