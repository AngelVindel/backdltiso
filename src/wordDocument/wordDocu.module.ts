import { Module } from '@nestjs/common';
import { WordController } from './wordDocu.controller';
import { WordService } from './wordDocu.service';
import { WordService2 } from './wordDocu2.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegularUser } from 'src/user/regularU.entity';
import { WordDoc } from './wordDocu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WordDoc,RegularUser])],
  controllers: [WordController],
  providers: [WordService,WordService2],
  exports: [WordService,WordService2]

})
export class WordModule {}
