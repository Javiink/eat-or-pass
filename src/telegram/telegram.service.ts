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

  @Action('like')
  async like(@Ctx() ctx: Context) {
    this.dishesService.resolvePendingDish(ctx.from.id, 'like');
  }

  @Action('dislike')
  async dislike(@Ctx() ctx: Context) {
    this.dishesService.resolvePendingDish(ctx.from.id, 'dislike');
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
      const dish = await this.dishesService.requestDishforUser(ctx.from);
      ctx.replyWithMarkdownV2(await this.composeDishMessage(dish), {
        link_preview_options: {
          url: dish.imgUrl,
          prefer_large_media: true,
          show_above_text: true,
        },
        reply_markup: this.composeDishInlineKeyboard(),
      });
    }
  }

  async composeDishMessage(dish: Dish) {
    const allergenString = this.dishesService.renderAllergens(dish.allergens);
    const msg = `*🍽️ ${dish.name}*\n\n${dish.vegetarian ? '🌱 Vegetarian\n\n' : ''}${allergenString}
    `;
    return msg;
  }

  composeDishInlineKeyboard() {
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('✅ Eat ✅', `like`),
      Markup.button.callback('❌ Pass ❌', `dislike`),
    ]).reply_markup;
    return keyboard;
  }
}
