/* eslint-disable prettier/prettier */
import { IsString } from 'class-validator';

export class SendEmailDto {
  @IsString()
  name: string;

  @IsString()
  subject: string;

  @IsString()
  from?: string;

  @IsString()
  to?: string;

  @IsString()
  html?: string;

  @IsString()
  react?: string;
}