import { Injectable } from "@nestjs/common";
import { Question } from "./questions.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosError } from "axios";
import { questionData } from "./dto/opQuestion.dto";


@Injectable()
export class QuestionsService{
    constructor(
        @InjectRepository(Question)
        private questionRepository: Repository<Question>,
        private httpService: HttpService,

     ) {}

  
    
   

 async getQuestionById(id: number): Promise <Question> {
        const question = await this.questionRepository.findOneBy({ id });
        if (!question) {
          throw new Error(`Question with ID ${id} not found`);
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
/*
      async  generateText(queries: string[]): Promise<any[]> {
        const api_key = "app-1nLhPKx1FsE7CxPpONAmZytr"
        const base_url = "http://synopsis-back-probability-univ.trycloudflare.com/v1"
        try {
            const responses: any[] = [];
            for (const query of queries) {
                const data = {
                    inputs: { query },
                    response_mode: 'blocking',
                    user: 'AdrianDLTCode'
                };
                const headers = {
                    Authorization: `Bearer ${api_key}`,
                    'Content-Type': 'application/json'
                };
                const response = await axios.post(`${base_url}/completion-messages`, data, { headers });
                const generatedText = response.data.answer;
                responses.push({ query, generatedText });
            }
            return responses;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                return queries.map(query => ({
                    query,
                    error: axiosError.message
                }));
            } else {
                // Handle other unexpected errors
                return queries.map(query => ({
                    query,
                    error: 'An unexpected error occurred'
                }));
            }
        }
    }
    */
    
      async postNewQuestion(userId:number, text: string) : Promise<any> {
        const apiUrl = "https://secretary-drives-baptist-vulnerability.trycloudflare.com/v1/chat-messages"; 
        const apiKey = "app-SZg44qKsRuhTZ2YWGWKBHekY"; 

        try{
          const data = {
            inputs: {},
            query: text ,
            response_mode: 'blocking',
            user: 'AdrianDLTCode'
        };
        const headers = {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };
        const response = await axios.post(`${apiUrl}`, data, { headers });
                const generatedText = response.data.answer;
                const question = await this.questionRepository.create({
                  userId,
                  text,
              });
              await this.questionRepository.save(question);
               

              //------------------------Almacenar en OpenSearch-----------------------
                const questionData:questionData = {
                  questionID: question.id,
                  userId: userId,
                  question: text,
                  answer: generatedText
              };
  
                            
              return  questionData;    
                } catch (error) {
          if (axios.isAxiosError(error)) {
              const axiosError = error as AxiosError;
              return axiosError.message
          }
      }
  }


   
     
      
      async getAllQuestions(): Promise<Question[]> {
        return this.questionRepository.find();
      }
}
 /*  async getQuestionAndAnswers(id: number): Promise<Question> {
        const question = await this.questionRepository.findOne({
          where: { id: id },
          relations: ['answers'] 
        });
      
              if (!question) {
          throw new Error(`Question with ${id}  not found`);
        }
        return question;
      }*/