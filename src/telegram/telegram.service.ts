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

  /**
   * Sends a welcoming message to the user with a button to request a dish suggestion
   * @param ctx Context
   */
  @Start()
  async startCommand(ctx: Context) {
    try {
      await this.userService.findOneOrCreate(ctx.from);
      await ctx.replyWithHTML(
        "<b>Hello! 🙂</b>\nI'm here to find some dishes that you'd love.🍝\n\n<b>🤔 How do this work?</b>\nI will send you dishes, and you have the choice to eat them or pass. Based on your previous choices, I will recommend new dishes through AI.\n\nShould we start? 🤤",
        {
          reply_markup: this.composeGetDishInlineKeyboard(),
        },
      );
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Deletes the like/dislike buttons from the message and calls the suggestion manager
   * @param ctx Context
   */
  @Action('getSuggestion')
  getSuggestionAction(@Ctx() ctx: Context) {
    ctx.editMessageReplyMarkup(Markup.inlineKeyboard([]).reply_markup);
    this.suggestionCommand(ctx);
  }

  /**
   * Sends a "looking for a dish..." message to the user and then calls the dish requester. If a dish is successfully generated, sends it to the user. If generation fails, warns the user and shows a button to retry in the "looking for a dish" message
   * @param ctx Context
   * @returns void
   */
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
          `❗ Oops! We couldn't find a dish for you.\nPlease, try again in a while. ⤵️`,
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

  /**
   * Sends a message to the user with their latest liked dishes
   * @param ctx Context
   */
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

  /**
   * Resolves the like status of the pending dish based on the action
   * @param ctx Context
   * @param action 'like' | 'dislike'
   */
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

  /**
   * Sends a dish to the user for them to like or dislike
   * @param ctx Context
   * @param dish Dish
   * @returns Promise<Message.TextMessage>
   */
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

  /**
   * Composes a pretty dish message based on input
   * @param dish Dish
   * @returns string
   */
  composeDishMessage(dish: Dish) {
    const allergenString = this.dishesService.renderAllergens(dish.allergens);
    const msg = `*🍽️ ${dish.name}*\n\n🌐 ${dish.ethnicity}\nℹ️ ${dish.description}\n\n${dish.vegetarian ? '🌱 Vegetarian\n\n' : ''}${allergenString}`;
    return msg;
  }

  /**
   * Generates an inline keyboard with like and dislike options
   * @returns InlineKeyboardMarkup
   */
  composeDishInlineKeyboard() {
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('✅ Eat ✅', `like`),
      Markup.button.callback('❌ Pass ❌', `dislike`),
    ]).reply_markup;
    return keyboard;
  }

  /**
   * Generates an inline keyboard with a button to generate a dish
   * @returns InlineKeyboardMarkup
   */
  composeGetDishInlineKeyboard() {
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('🔎 Find my ideal dish please!', `getSuggestion`),
    ]).reply_markup;
    return keyboard;
  }
}
