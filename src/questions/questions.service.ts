import { Injectable } from "@nestjs/common";
import { Question } from "./questions.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QuestionDTO } from "./dto/questions.dto";

@Injectable()
export class QuestionsService{
    constructor(
        @InjectRepository(Question)
        private questionRepository: Repository<Question>,
    ) {}

  
    
      async getQuestionById(id: number): Promise<Question> {
        const question = await this.questionRepository.findOneBy({ id });
        if (!question) {
          throw new Error(`La pregunta con ${id} no ha sido encontrada`);
        }
        return question;
      }
      async deleteQuestion(id: number): Promise<void> {
      await this.questionRepository.delete(id);
        
      }
      async postNewQuestion(questionDto: QuestionDTO): Promise<Question>{

        const newQuestion= this.questionRepository.create(questionDto);
        await this.questionRepository.save(newQuestion);
        return newQuestion;
        
      }
          
      async getAllQuestions(): Promise<Question[]> {
        return this.questionRepository.find();
      }
}