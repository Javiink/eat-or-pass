import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty({
    example: 55555555,
  })
  id: number;

  @ApiProperty({
    example: 'John Doe',
  })
  first_name: string;

  @ApiProperty({
    example: 'johndoe',
  })
  username?: string;
}
