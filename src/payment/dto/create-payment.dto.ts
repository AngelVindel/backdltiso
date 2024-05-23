/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Correo electrónico del cliente',
    example: 'correo@ejemplo.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'ID del precio',
    example: 'price_1P1pl8006fS5TbMzjFrYqbm3',
  })
  @IsString()
  @IsNotEmpty() 
  priceId: 'price_1P1pl8006fS5TbMzjFrYqbm3';
    static email: any;
}
