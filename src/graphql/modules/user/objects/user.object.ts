import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from 'src/drizzle/schema';
import { BaseEntity } from 'src/graphql/common/base/base.entity';

@ObjectType()
export class User extends BaseEntity implements UserType {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  userName: string;

  @Field({ nullable: true })
  avatar: string;
}
