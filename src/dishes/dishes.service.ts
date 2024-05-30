import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { ImagesService } from 'src/images/images.service';
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
    private imagesService: ImagesService,
  ) {}

  async requestDishforUser(fromUser: CreateUserDto) {
    const latestDishes =
      await this.userService.getLatestDishesForUser(fromUser);
    console.log(JSON.stringify(latestDishes));
    //const newDish: Dish = await this.aiService.generateDish(latestDishes);
    const newDish: Dish = {
      name: 'Spaghetti Bolognese',
      vegetarian: false,
      allergens: {
        nut: false,
        fish: false,
        egg: true,
        crustaceans: false,
        lactose: false,
        gluten: true,
      },
    };
    newDish.imgUrl = await this.imagesService.getImageForDish(newDish.name);
    this.userService.savePendingDishById(fromUser.id, newDish.name);
    return newDish;
  }

  async resolvePendingDish(userId: number, action: 'like' | 'dislike') {
    const pendingDish = await this.userService.getPendingDishById(userId);
    if (!pendingDish.pending) {
      return false;
    }
    return (
      await this.userService.updateDishes(userId, {
        [action]: pendingDish.pending,
      })
    ).acknowledged;
  }

  /**
   *
   * @param userId
   * @param dish
   * @param liked
   * @returns
   * @deprecated
   */
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
