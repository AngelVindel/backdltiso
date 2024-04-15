import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';



@Module({
    controllers:[AnswersController],
    providers:[AnswersController]
})
export class AnswersModule {}