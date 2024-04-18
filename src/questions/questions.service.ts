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
        const question = await this.questionRepository.findOne({
          where: { id: id },
          relations: ['answers'] 
        });
      
              if (!question) {
          throw new Error(`Question with ${id}  not found`);
        }
        return question;
      }
      async deleteQuestion(id: number): Promise<void> {
        const question = await this.questionRepository.findOneBy({ id });
        if (!question) {
          throw new Error(`Question with ID ${id} not found`);
        }
        await this.questionRepository.remove(question);        
      }
      async postNewQuestion(id: number,questionDto: QuestionDTO): Promise<Question>{

        const newQuestion= this.questionRepository.create({
          id,
          description:questionDto.description,
          text: questionDto.text,
          answers: questionDto.answers

        }
        );
        await this.questionRepository.save(newQuestion);
        return newQuestion;
        
      }
          
      async getAllQuestions(): Promise<Question[]> {
        return this.questionRepository.find();
      }
}