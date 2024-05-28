/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Sse } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { QuestionDTO } from "./dto/questions.dto";
import { Observable, map } from "rxjs";


@Controller('questions')
export class QuestionsController{

    constructor(private readonly questionsService: QuestionsService) {}

    @Sse('sse')
    async sse(@Body() dto: QuestionDTO): Promise<Observable<MessageEvent<any>>> {
      return await  (await this.questionsService.postNewQuestion(dto.email, dto.text)).pipe(
        map(data => new MessageEvent('message', { data }))
      );
    }
    /*
      @Post('newQuestion')
      async postNewQuestion(@Body() dto: QuestionDTO,@Res() res: Response){
        const question= await this.questionsService.postNewQuestion(dto.email,dto.text,res);
        return question;
      }*/
      @Post('allQuestions')
      async getAllQuestions(){
        const questions= await this.questionsService.getAllQuestions();
        return questions;
      }

  /*
  @Get('/answers/:id')
  async getQuestionAndAnswers(@Param('id') id: number) {
    const question = await this.questionsService.getQuestionAndAnswers(id);
    return question;
  }
  */


}