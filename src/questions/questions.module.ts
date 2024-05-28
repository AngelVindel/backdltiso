/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './questions.entity';
import { HttpModule } from '@nestjs/axios';
import { RegularUser } from 'src/user/regularU.entity';
import { OpenSearchService } from 'src/opensearch/OpServices';
import { EventEmitter } from 'typeorm/platform/PlatformTools';


@Module({ 
    imports: [
        
        HttpModule,

        TypeOrmModule.forFeature([Question,RegularUser])],
    controllers: [QuestionsController],
    providers: [QuestionsService,OpenSearchService,EventEmitter],
    exports: [QuestionsService]
})
export class QuestionsModule {}

