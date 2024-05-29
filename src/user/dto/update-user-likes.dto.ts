import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserLikesDto {
  @ApiProperty({
    example: 'Spaghetti Aglio e Olio',
  })
  like?: string;

  @ApiProperty({
    example: 'Chocolate palmier',
  })
  dislike?: string;
}
