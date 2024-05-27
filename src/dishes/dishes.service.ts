import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DishesService {
  async getDish() {
    const model = google(process.env.GEMINI_MODEL);

    const prompt: string = '[]'; //@TODO: Array JSON de comidas stringified desde el user

    const result = await streamText({
      model,
      prompt,
      system: `You will be recommending dishes related to a JSON input that I will provide. The input JSON has a "name" field and an "liked" field. The name is a string with the name of the dishes and the "liked" field will contain a boolean indicating if the user likes (true) or dislikes (false) that specific dish. You must return a JSON with a field "name" with the name of the dish, a field "vegetarian" with a boolean depending of the dish being vegetarian or not, a field "allergens" with an object of the allergens present in the dish, the possible allergens are the following: nut, fish, egg, crustaceans. The name of the dish must be spelled in english. The dish must not be included in the input JSON, it has to be a new one (including ingredients, origin country, dish type, etc) based on the liked and disliked dishes of the input JSON. Return directly the JSON. Do not include the prompt in the response.`,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return result.toAIStreamResponse();
  }
}
