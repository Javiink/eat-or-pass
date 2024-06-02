import { Injectable } from '@nestjs/common';
import { Action, Command, Ctx, Start, Update } from 'nestjs-telegraf';
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
    try {
      await this.userService.findOneOrCreate(ctx.from);
      await ctx.replyWithHTML(
        "<b>Hello! 🙂</b>\nI'm here to find some dishes that you'd love.🍝\n\n<b>🤔 How do this works?</b>\nI will send you dishes, and you have the choice to eat them or pass. Based on your previous choices, I will recommend new dishes through AI.\n\nShould we start? 🤤",
        {
          reply_markup: this.composeGetDishInlineKeyboard(),
        },
      );
    } catch (error) {
      console.error(error);
    }
  }

  @Action('getSuggestion')
  getSuggestionAction(@Ctx() ctx: Context) {
    ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]).reply_markup);
    this.suggestionCommand(ctx);
  }

  @Command('suggestion')
  async suggestionCommand(@Ctx() ctx: Context) {
    try {
      const lookingMsg = await ctx.sendMessage(
        '🔎 Looking for your ideal dish...',
      );
      const dish = await this.dishesService.requestDishforUser(ctx.from);
      if (!dish) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          lookingMsg.message_id,
          null,
          `❗ Oops! We couldn't find a dish for you.\nPlease, try again in a while.`,
        );
        await ctx.telegram.editMessageReplyMarkup(
          ctx.chat.id,
          lookingMsg.message_id,
          null,
          this.composeGetDishInlineKeyboard(),
        );
        return false;
      }
      await this.sendDishMessage(ctx, dish);
      await ctx.deleteMessage(lookingMsg.message_id);
    } catch (error) {
      console.error(error);
    }
  }

  @Command('likes')
  async likesCommand(@Ctx() ctx: Context) {
    try {
      const liked = await this.dishesService.getLikedDishesForUser(ctx.from);
      await ctx.sendMessage(`✅ These are the dishes you liked:\n\n${liked}`);
    } catch (error) {
      console.error(error);
    }
  }

  @Action('like')
  likeAction(@Ctx() ctx: Context) {
    this.messageAction(ctx, 'like');
  }

  @Action('dislike')
  dislikeAction(@Ctx() ctx: Context) {
    this.messageAction(ctx, 'dislike');
  }

  async messageAction(ctx: Context, action: 'like' | 'dislike') {
    try {
      ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]).reply_markup);
      if (action == 'like') {
        ctx.answerCbQuery('🌟 Added to your likes!');
      } else {
        ctx.answerCbQuery('💔 Not your type, okay!');
      }

      this.dishesService.resolvePendingDish(ctx.from.id, action);

      this.suggestionCommand(ctx);
    } catch (error) {
      console.error(error);
    }
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

    try {
      return await ctx.replyWithMarkdownV2(
        this.composeDishMessage(dish),
        extra,
      );
    } catch (error) {
      console.error(error);
    }
  }

  composeDishMessage(dish: Dish) {
    const allergenString = this.dishesService.renderAllergens(dish.allergens);
    const msg = `*🍽️ ${dish.name}*\n\n🌐 ${dish.ethnicity}\nℹ️ ${dish.description}\n\n${dish.vegetarian ? '🌱 Vegetarian\n\n' : ''}${allergenString}`;
    return msg;
  }

  composeDishInlineKeyboard() {
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('✅ Eat ✅', `like`),
      Markup.button.callback('❌ Pass ❌', `dislike`),
    ]).reply_markup;
    return keyboard;
  }

  composeGetDishInlineKeyboard() {
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('🔎 Find my ideal dish please!', `getSuggestion`),
    ]).reply_markup;
    return keyboard;
  }
}
