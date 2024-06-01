import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { Dish } from 'src/dishes/dishes.service';

@Injectable()
export class AiService {
  async generateDish(payload: { like: string[]; dislike: string[] }) {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    return await groq.chat.completions
      .create({
        messages: [
          {
            role: 'system',
            content:
              'You will be recommending a dish related to a JSON input that I will provide. The input JSON has a "like" and a "dislike" field that contains dishes that the user likes or dislikes. You must return a JSON following this schema: {name: string, description: string, ethnicity: string, vegetarian: boolean, allergens: []}. The "allergens" field is an array that should include only the allergens present in the dish, of the following: nut, egg, fish, crustaceans, lactose, gluten. You must be very careful of this points: First, don\'t generate a dish that is already present in the input JSON. Second, don\'t generate a dish of the same ethnicity or main ingredient as the last two dishes of the "like" and "dislike" fields of the input JSON. Return directly the plain stringified JSON (without code formatting). Do not include the prompt in the response. If the input JSON, or the "like" and "dislike" fields are empty or not present, generate a random dish.',
          },
          {
            role: 'user',
            content: JSON.stringify(payload),
          },
        ],
        model: process.env.GROQ_MODEL,
        response_format: {
          type: 'json_object',
        },
      })
      .then((chatCompletion) => {
        const response = chatCompletion.choices[0]?.message?.content || '';
        if (response.length < 1) {
          throw new Error(`Error querying Groq API: No dish generated by AI`);
        }

        const dish: Dish = JSON.parse(response); //TODO: This should map to a DTO
        dish.name = this.escapeMarkdown(dish.name);
        dish.description = this.escapeMarkdown(dish.description);
        return dish;
      })
      .catch((err) => {
        throw new Error(`Error querying Groq API: ${err}`);
      });

    /*   'You will be recommending a dish related to a JSON input that I will provide. The input JSON has a "like" and a "dislike" field that contains dishes that the user likes or dislikes. You must return a JSON following this schema: {name: string, description: string, ethnicity: string, vegetarian: boolean, allergens: { nut: boolean, egg: boolean, fish: boolean, crustaceans: boolean, lactose: boolean, gluten: boolean}}. You must be very careful of this points: First, don\'t generate a dish that is already present in the input JSON. Second, don\'t generate a dish of the same ethnicity or main ingredient as the last two dishes of the "like" and "dislike" fields of the input JSON. Return directly the plain stringified JSON (without code formatting). Do not include the prompt in the response. ', */
  }

  //TODO: This shouldn't be here, make a pipe or service
  escapeMarkdown(input: string): string {
    const escapeChars = [
      '\\',
      '*',
      '_',
      '~',
      '{',
      '}',
      '[',
      ']',
      '(',
      ')',
      '#',
      '+',
      '-',
      '.',
      '!',
      '`',
      '>',
      '|',
    ];
    let escapedString = input;
    escapeChars.forEach((char) => {
      const escapedChar = '\\' + char;
      const regex = new RegExp(`\\${char}`, 'g');
      escapedString = escapedString.replace(regex, escapedChar);
    });
    return escapedString;
  }
}
