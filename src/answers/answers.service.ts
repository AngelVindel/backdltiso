import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Answer } from "./answers.entity";
import { In, Repository } from "typeorm";
import { AnswerDto } from "./dto/answers.dto";
import { Question } from '../questions/questions.entity';

@Injectable()
export class AnswersService{
    constructor(
        @InjectRepository(Answer)
        private answersRepository: Repository<Answer>,
        @InjectRepository(Question)
        private questionRepository: Repository<Question>

    ){ }

    async getAllAnswers():Promise<Answer[]>{
      const answers= await this.answersRepository.find();
      return answers;
    }
    async getAnswersByQuestion(questionId: number): Promise<Answer[]> {
        const answers = await this.answersRepository.find({
          where: { question: { id: questionId} },
          relations: ["question"]  
        });
    
        return answers;
      }
      

      async postAnswerByQuestion(questionId: number, answerDto: AnswerDto): Promise<Answer>{
        const question =await this.questionRepository.findOneBy({id:questionId});
        if(!question)
          throw new Error(`Question with ID ${questionId} not found`);

        const newAnswer= this.answersRepository.create({
          text :answerDto.text,
          question: question
        })

      const answer= await this.answersRepository.save(newAnswer);
        

      return answer;
      }

      async deleteAnswer(id: number): Promise<void> {
        await this.answersRepository.delete(id); 
        }


        async getQuestionByAnswer(answerId:number): Promise<Question>{
          const answer = await this.answersRepository.findOne({
            where: { id: answerId },
            relations: ['question']
          });
          if (!answer) {
            throw new Error(`Answer with ID ${answerId} not found`);
          }
      
          return answer.question;
        }


        }

    
