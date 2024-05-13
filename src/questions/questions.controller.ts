import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { QuestionDTO } from "./dto/questions.dto";


@Controller('questions')
export class QuestionsController{

    constructor(private readonly questionsService: QuestionsService) {}

    @Get()
    getAllQuestions(){
        return this.questionsService.getAllQuestions();
    }

  

 @Get(':id')
  async getQuestionById(@Param('id') id: number) {
    const question = await this.questionsService.getQuestionById(id);
    return question;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') id: number) {
    await this.questionsService.deleteQuestion(id);

  }

  @Post()
  async postNewQuestion(@Body() dto: QuestionDTO){
    const question= await this.questionsService.postNewQuestion(dto.userID,dto.text);
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