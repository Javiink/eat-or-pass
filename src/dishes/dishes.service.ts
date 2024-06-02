import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { ImagesService } from 'src/images/images.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
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

  /**
   * Returns a generated dish for the `fromUser` and updates 'pending' field of the database
   * @param fromUser CreateUserDto
   * @returns Promise<Dish | false>
   */
  async requestDishforUser(fromUser: CreateUserDto): Promise<Dish | false> {
    try {
      const latestDishes =
        await this.userService.getLatestDishesForUser(fromUser);
      const newDish: Dish | boolean =
        await this.aiService.generateDish(latestDishes);
      if (!newDish) return false;

      newDish.imgUrl = await this.imagesService.getImageForDish(newDish.name);

      this.userService.savePendingDishById(fromUser.id, newDish.name);
      return newDish;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Resolves pending dish in the user Document moving it to the `action` field
   * @param userId number
   * @param action 'like' | 'dislike'
   * @returns Promise<boolean>
   */
  async resolvePendingDish(userId: number, action: 'like' | 'dislike') {
    try {
      const pendingDish = await this.userService.getPendingDishById(userId);
      if (!pendingDish.pending) {
        return false;
      }
      return (
        await this.userService.updateDishes(userId, {
          [action]: pendingDish.pending,
        })
      ).acknowledged;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Returns the latest 30 liked dishes by the `user`
   * @param user CreateUserDto
   * @returns Promise
   */
  async getLikedDishesForUser(user: CreateUserDto) {
    try {
      const likedDishes = await this.userService.getLatestLikesById(
        user.id,
        30,
      );
      return likedDishes[0].like.join('\n');
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Returns a formatted allergen string to include in the reply message
   * @param allergens string[]
   * @returns string
   */
  renderAllergens(allergens: string[]) {
    if (allergens.length < 1) return '';

    const allergenList: string[] = ['Allergens:'];

    allergens.forEach((allergen) => {
      allergenList.push(this.allergenMap[allergen]);
    });

    return allergenList.join('\n');
  }
}

//TODO: Make this a DTO
export type Dish = {
  name: string;
  description: string;
  imgUrl?: string;
  vegetarian: boolean;
  ethnicity: string;
  allergens: ['nut' | 'egg' | 'fish' | 'crustaceans' | 'lactose' | 'gluten'];
};
