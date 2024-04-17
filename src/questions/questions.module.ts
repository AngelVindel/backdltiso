import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './questions.entity';
import { Answer } from 'src/answers/answers.entity';


@Module({ 
    imports: [TypeOrmModule.forFeature([Question,Answer])],
    controllers: [QuestionsController],
    providers: [QuestionsService],
})
export class QuestionsModule {}

