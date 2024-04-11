import { Injectable } from "@nestjs/common";
import { Question } from "./questions.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class QuestionsService{
    constructor(
        @InjectRepository(Question)
        private questionRepository: Repository<Question>,
    ) {}

  
    
      async getQuestionById(id: number): Promise<Question> {
        const question = await this.questionRepository.findOneBy({ id });
        if (!question) {
          throw new Error(`Question with ID ${id} not found`);
        }
        return question;
      }
      async deleteQuestion(id: number): Promise<void> {
      await this.questionRepository.delete(id);
        
      }
          
      async getAllQuestions(): Promise<Question[]> {
        return this.questionRepository.find();
      }
}