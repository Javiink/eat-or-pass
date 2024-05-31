import { Injectable } from '@nestjs/common';
import {
  Action,
  Command,
  Ctx,
  Hears,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
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
    await this.userService.findOneOrCreate(ctx.from);
    await ctx.replyWithHTML(
      "<b>Hello! 🙂</b>\nI'm here to find some dishes that you'd love.🍝\n\n<b>🤔 How do this works?</b>\nI will send you dishes, and you have the choice to eat them or pass. Based on your previous choices, I will recommend new dishes through AI.\n\nShould we start? 🤤",
      {
        reply_markup: this.composeWelcomeInlineKeyboard(),
      },
    );
  }

  @Action('firstSuggestion')
  async firstSuggestionAction(@Ctx() ctx: Context) {
    ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]).reply_markup);
    this.suggestionCommand(ctx);
  }

  @Command('suggestion')
  async suggestionCommand(@Ctx() ctx: Context) {
    const lookingMsg = await ctx.sendMessage(
      '🔎 Looking for your ideal dish...',
    );
    const dish = await this.dishesService.requestDishforUser(ctx.from);
    await this.sendDishMessage(ctx, dish);
    await ctx.deleteMessage(lookingMsg.message_id);
  }

  @Command('likes')
  async likesCommand(@Ctx() ctx: Context) {
    const liked = await this.dishesService.getLikedDishesForUser(ctx.from);
    await ctx.sendMessage(`✅ These are the dishes you liked:\n\n${liked}`);
  }

  @Action('like')
  async likeAction(@Ctx() ctx: Context) {
    this.messageAction(ctx, 'like');
  }

  @Action('dislike')
  async dislikeAction(@Ctx() ctx: Context) {
    this.messageAction(ctx, 'dislike');
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
    }
  }

  async messageAction(ctx: Context, action: 'like' | 'dislike') {
    ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]).reply_markup);
    if (action == 'like') {
      ctx.answerCbQuery('🌟 Added to your likes!');
    } else {
      ctx.answerCbQuery('💔 Not your type, okay!');
    }
    const lookingMsg = await ctx.sendMessage(
      '🔎 Looking for your ideal dish...',
    );

    this.dishesService.resolvePendingDish(ctx.from.id, action);

    const dish = await this.dishesService.requestDishforUser(ctx.from);
    await this.sendDishMessage(ctx, dish);
    await ctx.deleteMessage(lookingMsg.message_id);
  }

  async sendDishMessage(ctx: Context, dish: Dish) {
    const extra = {
      link_preview_options: {
        url: dish.imgUrl,
        prefer_large_media: true,
        show_above_text: true,
      },
      reply_markup: this.composeDishInlineKeyboard(),
    };

    return await ctx.replyWithMarkdownV2(
      await this.composeDishMessage(dish),
      extra,
    );
  }

  async composeDishMessage(dish: Dish) {
    const allergenString = this.dishesService.renderAllergens(dish.allergens);
    const msg = `*🍽️ ${dish.name}*\n\nℹ️ ${dish.description}\n\n${dish.vegetarian ? '🌱 Vegetarian\n\n' : ''}${allergenString}`;
    return msg;
  }

  composeDishInlineKeyboard() {
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('✅ Eat ✅', `like`),
      Markup.button.callback('❌ Pass ❌', `dislike`),
    ]).reply_markup;
    return keyboard;
  }

  composeWelcomeInlineKeyboard() {
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback(
        '🔎 Find my ideal dish please!',
        `firstSuggestion`,
      ),
    ]).reply_markup;
    return keyboard;
  }
}
