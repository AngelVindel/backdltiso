import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  activation_token: number;
  premium: boolean;
}

export class UpdateUserDto {
  @IsString()
  username?: string;

  @IsString()
  fullname?: string;

  @IsEmail()
  email?: string;

  @IsString()
  actualPassword?: string;

  @IsString()
  newPassword?: string;

  @IsString()
  userPhoto?: string;
}
