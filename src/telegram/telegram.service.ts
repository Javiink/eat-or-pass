import { Injectable } from '@nestjs/common';
import { Action, Ctx, Hears, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { UsersService } from '../users/users.service';

@Update()
@Injectable()
export class TelegramService {
  constructor(private usersService: UsersService) {}

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
}
