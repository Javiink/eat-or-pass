import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty({
    example: '55555555',
  })
  readonly id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  readonly name?: string;
}
