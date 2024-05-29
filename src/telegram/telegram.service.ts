import { Injectable } from '@nestjs/common';
import { Action, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { DishesService } from '../dishes/dishes.service';

@Update()
@Injectable()
export class TelegramService {
  constructor(private dishesService: DishesService) {}

  @Start()
  async startCommand(ctx: Context) {
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
      this.dishesService.requestDishforUserId(ctx.from.id.toString());
    } else if (msg.startsWith('#add-dish-like')) {
      await this.dishesService.addDishForUserId(
        ctx.from.id.toString(),
        msg.split('\n').slice(1)[0],
        true,
      );
    } else if (msg.startsWith('#add-dish-dislike')) {
      this.dishesService.addDishForUserId(
        ctx.from.id.toString(),
        msg.split('\n').slice(1)[0],
        false,
      );
    }
  }
}
