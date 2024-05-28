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
    const newDish = this.dishesService.getDish();
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
  async test(@Ctx() ctx: Context) {
    const msg = ctx.text;
    if (msg.startsWith('#test\n')) {
      const text = msg.split('\n').slice(1).join('\n');
      const res = await this.dishesService.getDish(text);
      ctx.reply(res);
    }
  }
}
