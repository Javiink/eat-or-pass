import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  id: number;

  @Prop()
  username?: string;

  @Prop()
  first_name?: string;

  @Prop()
  like?: string[];

  @Prop()
  dislike?: string[];

  @Prop()
  pending?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
