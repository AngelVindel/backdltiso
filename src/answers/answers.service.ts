import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Answer } from "./answers.entity";
import { Repository } from "typeorm";

@Injectable()
export class AnswersService{
    constructor(
        @InjectRepository(Answer)
        private answersRepository: Repository<Answer>

    ){ }

    async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
        const answers = await this.answersRepository.find({
         // where: { question: { id: questionId } },
          relations: ["question"]  
        });
    
        return answers;
      }



    
}