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

  async updateDishes(id: string, updateUserLikesDto: UpdateUserLikesDto) {
    return await this.userModel
      .updateOne({ id }, { $push: updateUserLikesDto })
      .exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne({ id }).exec();
  }

  async findOneOrCreate(id: string) {
    let user = await this.findOne(id);
    if (!user) {
      user = await this.create({ id });
    }
    return user;
  }

  async getLatestDishesForUserId(userId: string) {
    if ((await this.userModel.countDocuments({ id: userId })) < 1) {
      await this.create({ id: userId }); // Create the user if it does not exist
    }

    const latestNumber = parseInt(process.env.LATEST_DISHES_NUMBER);
    // The number of disliked dishes will be the 30% of the total dishes that we will send
    const dislikedNumber = Math.floor(latestNumber * 0.3);
    const likedNumber = latestNumber - dislikedNumber;
    const user = await this.userModel
      .aggregate()
      .match({ id: userId })
      .limit(1)
      .project({
        liked: {
          $slice: ['$liked', likedNumber * -1],
        },
        disliked: {
          $slice: ['$disliked', dislikedNumber * -1],
        },
      })
      .exec();

    console.log('getLastDishesForUserId user:', user);
    return {
      liked: { ...user[0].liked },
      disliked: { ...user[0].disliked },
    };
  }
}
