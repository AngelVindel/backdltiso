import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { AnswersService } from "./answers.service";
import { AnswerDto } from "./dto/answers.dto";


@Controller('answers')
export class AnswersController{

    constructor(private readonly answersService: AnswersService) {}


@Get(':id')
async getAnswersByQuestion(@Param('id') id: number){

    const answers =await this.answersService.getAnswersByQuestion(id)
    return answers;
}

@Post(':id')
async postAnswerByQuestion(@Param('id') id: number,@Body() answerDto: AnswerDto){

    const answer= await this.answersService.postAnswerByQuestion(id,answerDto);
    
    return answer;
}

@Delete(':id/idAnswer')
@HttpCode(HttpStatus.NO_CONTENT)
async deleteAnswer(@Param('idAnswer') id: number){
    await this.answersService.deleteAnswer(id);
}



}