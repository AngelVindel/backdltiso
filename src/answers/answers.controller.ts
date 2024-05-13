import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { AnswersService } from "./answers.service";
import { AnswerDto } from "./dto/answers.dto";


@Controller('answers')
export class AnswersController{

    constructor(private readonly answersService: AnswersService) {}


    /*
@Get()
async getAllAnswers(){
    const answers=  await this.answersService.getAllAnswers();
    return answers;
}


@Get('question/:id')
async getAnswersByQuestion(@Param('id') id: number){

    const answers =await this.answersService.getAnswersByQuestion(id)
    return answers;
}

@Post('/question/:id')
async postAnswerByQuestion(@Param('id') id: number,@Body() answerDto: AnswerDto){

    const answer= await this.answersService.postAnswerByQuestion(id,answerDto);
    
    return answer;
}

@Delete(':idAnswer')
@HttpCode(HttpStatus.NO_CONTENT)
async deleteAnswer(@Param('idAnswer') id: number){
    await this.answersService.deleteAnswer(id);
}


@Get(':idAnswer')
async getQuestionByAnswer(@Param('id') idAnswer:number){
    const question= await this.answersService.getQuestionByAnswer(idAnswer);
    return question;
}
*/

}