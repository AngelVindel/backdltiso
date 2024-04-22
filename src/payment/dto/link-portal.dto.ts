import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkPortalDto {
  @ApiProperty({ description: 'ID de sesión', example: 'session_12345' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
