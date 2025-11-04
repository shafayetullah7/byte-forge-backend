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

    console.log('Error came here********');

    console.log(metadata, metatype);

    if (!metatype) {
      console.log('here');
      return value;
    }

    if (!value) {
      if (metadata.type) {
        console.log('came here', metadata);
        throw new BadRequestException(`${metadata.type} is required`);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const schema = (metatype as { schema?: any })?.schema;

    console.log('schema type', typeof schema);

    // if (schema instanceof ZodDto) {
    //   console.log('Its a zod dto');
    // } else {
    //   console.log('not zod dto');
    // }

    if (!schema || !isZodSchema(schema)) {
      console.log('here');
      return value;
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
