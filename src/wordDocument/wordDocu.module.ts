import { Module } from '@nestjs/common';
import { WordController } from './wordDocu.controller';
import { WordService } from './wordDocu.service';

@Module({
  controllers: [WordController],
  providers: [WordService],
})
export class WordModule {}
