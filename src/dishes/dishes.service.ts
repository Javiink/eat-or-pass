import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
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
}
