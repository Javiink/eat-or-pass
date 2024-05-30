import { Injectable } from '@nestjs/common';
import { Action, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { Dish, DishesService } from '../dishes/dishes.service';
import { ImagesService } from 'src/images/images.service';
import { UserService } from 'src/user/user.service';

@Update()
@Injectable()
export class TelegramService {
  constructor(
    private dishesService: DishesService,
    private userService: UserService,
    private imagesService: ImagesService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    await this.userService.create(ctx.from);
    await ctx.reply('Holi');
  }

  @Hears('asd')
  async hears(@Ctx() ctx: Context) {
    await ctx.reply(
      'a ver a ver',
      Markup.inlineKeyboard([
        Markup.button.callback('', `${ctx.from.id}|`),
        Markup.button.callback('', `${ctx.from.id}|`),
      ]),
    );
  }

  @Action('button1')
  async hearsButton1(@Ctx() ctx: Context) {
    console.log(ctx);
    await ctx.reply('button 1');
  }

  @On('message')
  async testMessage(@Ctx() ctx: Context) {
    const msg = ctx.text;
    if (msg.startsWith('#userdishes')) {
      this.dishesService.requestDishforUser(ctx.from);
    } else if (msg.startsWith('#add-dish-like')) {
      await this.dishesService.addDishForUserId(
        ctx.from.id,
        msg.split('\n').slice(1)[0],
        true,
      );
    } else if (msg.startsWith('#add-dish-dislike')) {
      this.dishesService.addDishForUserId(
        ctx.from.id,
        msg.split('\n').slice(1)[0],
        false,
      );
    } else if (msg.startsWith('#image')) {
      const imgUrl = await this.imagesService.getImageForDish(
        msg.split('\n').slice(1)[0],
      );
      ctx.replyWithMarkdownV2(imgUrl);
    } else if (msg.startsWith('#suggestion')) {
      /* const dish = this.dishesService.requestDishforUserId(
        ctx.from.id,
      ); */
      const dish: Dish = {
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
      dish.imgUrl = await this.imagesService.getImageForDish(dish.name);
      ctx.replyWithMarkdownV2(await this.composeMessage(dish), {
        link_preview_options: {
          url: dish.imgUrl,
          prefer_large_media: true,
          show_above_text: true,
        },
      });
    }
  }

  async composeMessage(dish: Dish) {
    const allergenString = this.dishesService.renderAllergens(dish.allergens);
    const msg = `*🍽️ ${dish.name}*\n\n${dish.vegetarian ? '🌱 Vegetarian\n\n' : ''}${allergenString}
    `;
    return msg;
  }
}
