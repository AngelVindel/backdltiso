/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { QuestionDTO } from "./dto/questions.dto";


@Controller('questions')
export class QuestionsController{

    constructor(private readonly questionsService: QuestionsService) {}


  @Post('newQuestion')
  async postNewQuestion(@Body() dto: QuestionDTO){
    const question= await this.questionsService.postNewQuestion(dto.email,dto.text);
    return question;
  }

  /*
  @Get('/answers/:id')
  async getQuestionAndAnswers(@Param('id') id: number) {
    const question = await this.questionsService.getQuestionAndAnswers(id);
    return question;
  }
  */


}