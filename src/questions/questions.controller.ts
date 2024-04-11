import { Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param } from "@nestjs/common";
import { QuestionsService } from "./questions.service";


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



}