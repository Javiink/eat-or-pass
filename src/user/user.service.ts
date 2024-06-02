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

  /**
   * Creates a new user
   * @param createUserDto User DTO
   * @returns Promise
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  /**
   * Adds a dish to the like or dislike field of the user that matches `id`
   * @param id User ID
   * @param updateUserLikesDto UpdateUserLikes DTO
   * @returns Promise
   */
  async updateDishes(id: number, updateUserLikesDto: UpdateUserLikesDto) {
    return await this.userModel
      .updateOne({ id }, { $push: updateUserLikesDto })
      .exec();
  }

  /**
   * Returns all the User documents
   * @returns Promise
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /**
   * Returns one User that matches the `id`
   * @param id User ID
   * @returns Promise
   */
  async findOneById(id: number): Promise<User> {
    return this.userModel.findOne({ id }).exec();
  }

  /**
   * Returns an User, if no results are found by the User ID, a new one is created
   * @param fromUser CreateUser DTO
   * @returns Promise
   */
  async findOneOrCreate(fromUser: CreateUserDto) {
    let user = await this.findOneById(fromUser.id);
    if (!user) {
      user = await this.create(fromUser);
    }
    return user;
  }

  /**
   * Updates the pending dish for the user that matches `id`
   * @param id User ID
   * @param dishName The name of the dish
   * @returns Promise
   */
  async savePendingDishById(id: number, dishName: string) {
    return await this.userModel.updateOne({ id }, { pending: dishName });
  }

  /**
   * Returns the pending dish for the user that matches the supplied `id`
   * @param id User ID
   * @returns Promise
   */
  async getPendingDishById(id: number) {
    return await this.userModel.findOne({ id }, 'pending');
  }

  /**
   * Returns an object with the latest liked and disliked dish names for the `fromUser`
   * @param fromUser CreateUser DTO
   * @returns Promise
   */
  async getLatestDishesForUser(fromUser: CreateUserDto): Promise<{like: string[], dislike: string[]}> { 
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
          $slice: ['$like', likedNumber * -1],
        },
        dislike: {
          $slice: ['$dislike', dislikedNumber * -1],
        },
      })
      .exec();

    return {
      like: [...user[0].like],
      dislike: [...user[0].dislike],
    };
  }

  /**
   * Returns the latest `number` of dishes for the user that matches the `id`
   * @param id User ID
   * @param number Number of dishes to return
   * @returns Promise
   */
  async getLatestLikesById(id: number, number: number) {
    return await this.userModel
      .aggregate()
      .match({ id })
      .limit(1)
      .project({
        like: {
          $slice: ['$like', number * -1],
        },
      })
      .exec();
  }
}
