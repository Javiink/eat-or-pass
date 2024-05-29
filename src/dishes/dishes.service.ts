import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { UpdateUserLikesDto } from 'src/user/dto/update-user-likes.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DishesService {
  constructor(
    private readonly userService: UserService,
    private readonly aiService: AiService,
  ) {}

  async requestDishforUserId(userId: string) {
    const latestDishes =
      await this.userService.getLatestDishesForUserId(userId);
    console.log(JSON.stringify(latestDishes));
    //return await this.aiService.generateDish(latestDishes);
  }

  async addDishForUserId(userId: string, dish: string, liked: boolean) {
    const data: UpdateUserLikesDto = {};
    if (!liked) {
      data.dislike = dish;
    } else {
      data.like = dish;
    }
    return (await this.userService.updateDishes(userId, data)).acknowledged;
  }
}
