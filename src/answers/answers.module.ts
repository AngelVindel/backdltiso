import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/questions/questions.entity';
import { Answer } from './answers.entity';
import { AnswersService } from './answers.service';


@Module({
    imports: [TypeOrmModule.forFeature([Question,Answer])],
    controllers:[AnswersController],
    providers:[AnswersService]
})
export class AnswersModule {}