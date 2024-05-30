import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UpdateUserLikesDto } from './dto/update-user-likes.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  async update(id: string, user: User) {
    return await this.userModel.updateOne({ id }, user).exec();
  }

  async updateDishes(id: number, updateUserLikesDto: UpdateUserLikesDto) {
    return await this.userModel
      .updateOne({ id }, { $push: updateUserLikesDto })
      .exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneById(id: number): Promise<User> {
    return this.userModel.findOne({ id }).exec();
  }

  async findOneOrCreate(fromUser: CreateUserDto) {
    let user = await this.findOneById(fromUser.id);
    if (!user) {
      user = await this.create(fromUser);
    }
    return user;
  }

  async savePendingDishById(id: number, dishName: string) {
    return await this.userModel.updateOne({ id }, { pending: dishName });
  }

  async getPendingDishById(id: number) {
    return await this.userModel.findOne({ id }, 'pending');
  }

  async getLatestDishesForUser(fromUser: CreateUserDto) {
    const userCount = await this.userModel.countDocuments({
      id: fromUser.id,
    });
    if (userCount < 1) {
      await this.create(fromUser); // Create the user if it does not exist
    }

    const latestNumber = parseInt(process.env.LATEST_DISHES_NUMBER);
    // The number of disliked dishes will be the 30% of the total dishes that we will send
    const dislikedNumber = Math.floor(latestNumber * 0.3);
    const likedNumber = latestNumber - dislikedNumber;
    const user = await this.userModel
      .aggregate()
      .match({ id: fromUser.id })
      .limit(1)
      .project({
        like: {
          $slice: ['$like', -likedNumber],
        },
        dislike: {
          $slice: ['$dislike', -dislikedNumber],
        },
      })
      .exec();

    console.log('getLatestDishesForUserId user:', user);
    return {
      like: [...user[0].like],
      dislike: [...user[0].dislike],
    };
  }
}
