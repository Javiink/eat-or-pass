import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  id: string;

  @Prop()
  like: string[];

  @Prop()
  dislike: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
