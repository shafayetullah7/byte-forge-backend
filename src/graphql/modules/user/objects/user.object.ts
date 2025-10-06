import { Field, ObjectType } from '@nestjs/graphql';
import { TUser } from '@/drizzle/schema';
import { BaseEntity } from '@/graphql/common/base/base.entity';

@ObjectType()
export class User extends BaseEntity implements TUser {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  userName: string;

  @Field({ nullable: true })
  avatar: string;
}
