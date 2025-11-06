import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { ZodError, ZodType } from 'zod';
// import { ZodDto } from '../factories/zod.dto.factory';

const isZodSchema = (value: unknown): value is ZodType => {
  return value instanceof ZodType;
};

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    const { metatype } = metadata;

    if (!metatype) {
      return value;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const schema = (metatype as { schema?: any })?.schema;

    if (!schema || !isZodSchema(schema)) {
      console.log('here');
      return value;
    }
    if (schema && !value) {
      if (metadata.type) {
        console.log('came here', metadata);
        throw new BadRequestException(`${metadata.type} is required`);
      }
    }

    try {
      return schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw error;
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
