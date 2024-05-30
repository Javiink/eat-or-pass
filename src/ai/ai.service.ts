import { google } from '@ai-sdk/google';
import { Injectable } from '@nestjs/common';
import { generateText } from 'ai';

@Injectable()
export class AiService {
  async generateDish(payload: { like: string[]; dislike: string[] }) {
    const model = google(process.env.GEMINI_MODEL);

    const prompt: string = JSON.stringify(payload);

    const result = await generateText({
      model,
      prompt,
      system: `You will be recommending dishes related to a JSON input that I will provide. The input JSON has a "like" and a "dislike" field. The like field will be an array containing dishes the user likes and the dislike will be an array containing dishes the user dislikes. You must return a JSON with a field "name" with the name of the dish, a field "description" containing a brief description of the dish with no more than 20 words, a field "vegetarian" with a boolean depending of the dish being vegetarian or not, a field "allergens" with an object of the allergens present in the dish, the possible allergens are the following: nut, fish, crustaceans, egg, lactose, gluten. The name of the dish and the description must be spelled in english. The dish must not be included in the input JSON, it has to be a different new one based on the liked and disliked dishes of the input JSON. The dish should avoid to be related to the country, have similar ingredients or be of the same type that the last element of the input JSON, but is preferably to ignore these considerations than return an empty response. Return directly the plain stringified JSON (without code formatting). Do not include the prompt in the response.`,
      maxTokens: 4096,
      temperature: 0.7,
    }).catch((e) => {
      throw new Error(`Error querying Gemini API: ${e}`);
    });

    console.log(result);
    return JSON.parse(result.text);
  }
}
