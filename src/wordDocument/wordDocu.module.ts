import { Module } from '@nestjs/common';
import { WordController } from './wordDocu.controller';
import { WordService } from './wordDocu.service';
import { WordService2 } from './wordDocu2.service';

@Module({
  controllers: [WordController],
  providers: [WordService,WordService2],
})
export class WordModule {}
