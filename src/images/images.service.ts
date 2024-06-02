import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class ImagesService {
  private apiUrl: string = `https://www.googleapis.com/customsearch/v1`;
  private baseParams = {
    key: process.env.GOOGLE_CUSTOMSEARCH_API_KEY,
    cx: process.env.GOOGLE_CUSTOMSEARCH_CX,
    searchType: 'image',
    num: 1,
  };

  constructor(private readonly httpService: HttpService) {}

  async getImageForDish(dishName: string) {
    try {
      if (dishName.length < 1) {
        throw new Error(
          'Can not search for a dish image if no dish name is provided!',
        );
      }
      const { data } = await firstValueFrom(
        this.httpService
          .get(this.apiUrl, {
            params: { ...this.baseParams, q: dishName },
          })
          .pipe(
            catchError((error) => {
              throw `An error ocurred while trying to fetch an image for the dish "${dishName}". Error: ${JSON.stringify(
                error?.response?.data,
              )}`;
            }),
          ),
      );
      return data.items[0].link;
    } catch (error) {
      console.error(error);
      return '';
    }
  }
}
