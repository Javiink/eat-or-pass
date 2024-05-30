import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserLikesDto } from 'src/user/dto/update-user-likes.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DishesService {
  private allergenMap: { [key: string]: string } = {
    nut: '🥜 Nut',
    fish: '🐟 Fish',
    egg: '🥚 Egg',
    crustaceans: '🦀 Crustaceans',
    lactose: '🐮 Lactose',
    gluten: '🌾 Gluten',
  };

  constructor(
    private readonly userService: UserService,
    private readonly aiService: AiService,
  ) {}

  async requestDishforUser(fromUser: CreateUserDto) {
    const latestDishes =
      await this.userService.getLatestDishesForUser(fromUser);
    console.log(JSON.stringify(latestDishes));
    //return await this.aiService.generateDish(latestDishes);
  }

  async addDishForUserId(userId: number, dish: string, liked: boolean) {
    const data: UpdateUserLikesDto = {};
    if (!liked) {
      data.dislike = dish;
    } else {
      data.like = dish;
    }
    return (await this.userService.updateDishes(userId, data)).acknowledged;
  }

  renderAllergens(allergens: { [key: string]: boolean }) {
    const allergenList: string[] = ['Allergens:'];

    for (const key in allergens) {
      if (allergens[key]) {
        allergenList.push(this.allergenMap[key]);
      }
    }

    return allergenList.join('\n');
  }
}

export type Dish = {
  name: string;
  imgUrl?: string;
  vegetarian: boolean;
  allergens: {
    nut: boolean;
    egg: boolean;
    fish: boolean;
    crustaceans: boolean;
    lactose: boolean;
    gluten: boolean;
  };
};
