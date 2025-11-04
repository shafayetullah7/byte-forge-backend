import { z, ZodSchema } from 'zod';

export interface ZodDto<T extends ZodSchema> {
  new (data: unknown): z.infer<T>;
  readonly schema: T;
}

export class ZodDtoFactory {
  static create<T extends ZodSchema>(schema: T) {
    class GenerateDto {
      static readonly schema = schema;
      constructor(data: unknown) {
        Object.assign(this, schema.parse(data));
      }
    }

    return GenerateDto as ZodDto<T>;
  }
}

// import { ZodSchema } from 'zod';

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// export abstract class ZodDto<T extends ZodSchema> {
//   static readonly schema: ZodSchema;

//   constructor(data: unknown) {
//     Object.assign(this, (this.constructor as typeof ZodDto).schema.parse(data));
//   }
// }

// export class ZodDtoFactory {
//   static create<T extends ZodSchema>(schema: T) {
//     class GenerateDto extends ZodDto<T> {
//       static readonly schema = schema;
//       constructor(data: unknown) {
//         super(data);
//       }
//     }

//     return GenerateDto;
//   }
// }
