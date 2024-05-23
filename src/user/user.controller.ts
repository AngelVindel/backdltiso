/* eslint-disable prettier/prettier */
// user.controller.ts
import { Controller, Post, Body, Get, UseGuards, Delete, Param, Patch, Put, Res } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from './user.service';
import { Response } from 'express';
import { DocumentPdfDto } from 'src/pdfDocument/dto/document-pdf.dto';
import { WordDoc } from 'src/wordDocument/wordDocu.entity';
import { DocuDto } from 'src/wordDocument/dto/wordDocu.dto';
import * as fs from 'fs';

@Controller('users')
export class UserController {
  private createdWordFileName: string = '';

  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.userService.signup(createUserDto);
  }

 
  //@UseGuards(JwtAuthGuard)
  @Get()
  getAllUsers(){
      return this.userService.getAllUsers();
  }

  @Get(":id")
  async getUserById(@Param("id") id:number){
    const user= await this.userService.getUserById(id);
    return user;
  }



  @Post()
  async getEmailUsers(@Body() body: { mail: string }){
      try {
          const { mail } = body;
          const users =await this.userService.getEmailUsers(mail);
          return users;
      } catch (error) {
          console.error('Error fetching users by email:', error);
      }
  }
  
 

  @Delete(":id")
  deleteUser(@Param("id") id:number){
      this.userService.deleteUser(id);
  }

  @Patch(":id")
  updateUser(@Param("id")id: number, @Body() updatedFields: UpdateUserDto){
      this.userService.updateUser(id,updatedFields);
  }
/*
  @Post(":id/question")
  async postNewQuestion(@Param("id") id: number,@Body("text") text: string){
    const repl= await this.userService.postNewQuestion(id,text);
    return repl;
  }*/

  @Post(":id/question/:idQ")
  async deleteQuestion(@Param("id") id: number,@Param("idQ") ID_question: number){
   await this.userService.deleteQuestion(id,ID_question)
    
  }
  @Get(':id/questions')
  async getQuestionsByUserId(@Param('id') id: number) {
    const questions= await this.userService.getQuestionsByUserId(id);
    return questions;
  }



  @Get(':id/pdfs')
  async getUserPdfs(@Param('id') userId: number) {
    const pdf= await this.userService.getUserPdfs(userId);
    return pdf;
  }
  @Get(':id/words')
  async getUserDocuments(@Param('id') userId: number) {
  
  return  await this.userService.getUserDocuments(userId);
  }


  @Post(":id/pdfs")
  async newUserPdf(@Param("id") userId: number,@Body() dto: DocumentPdfDto){
    const pdf= await this.userService.newUserPdf(userId,dto);
    return pdf;
  }
  @Post(":id/word/type/:type")
  async newUserDocument(@Param("id") userId: number,@Param("type") type: string,@Body() dto: DocuDto){
    const word= await this.userService.newUserDocument(userId,dto,parseInt(type));
    return word;
  }

  @Put(':id/pdfs/:idPdf')
  async updateUserPdf(@Param('id') userId:number, @Param('idPdf') pdfId: number, @Body() dto: DocumentPdfDto){
    const pdf=await this.userService.updateUserPdf(userId,pdfId,dto);
    return pdf;
  }
  
  @Delete(':id/pdfs/:idPdf')
  async deletePdfUser(@Param('id') userId:number, @Param('idPdf') documentId: number){
    await this.userService.deleteUserPdf(userId,documentId);
  }

  @Delete(':id/words/:idWord')
  async deleteWordUser(@Param('id') userId:number, @Param('idWord') wordId: number){
    await this.userService.deleteUserWord(userId,wordId);
  }

  @Get(':id/pdfs/:idPdf/download')
  async downloadPdf(@Param('id') userId: number, @Param('idPdf') pdfId: number, @Res() res:Response) {
      try {
          const pdfBuffer = await this.userService.downloadUserPdf(userId, pdfId);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="dlt_document.pdf"`);

          res.send(pdfBuffer);
      } catch (error) {
          res.status(404).send({ message: error.message });
      }
  }
  @Post(':id/words/:idWord/download')
  async downloadWord(
    @Param("id") id:number,@Param("idWord") wordId:number,@Res() res: Response) {
    try {
      const { wordBuffer, fileName } =
        await this.userService.downloadUserWord(id,wordId);
      const filePath = ` ../../../../../../Downloads/${fileName}.docx`; 
      fs.writeFileSync(filePath, wordBuffer);
      this.createdWordFileName = fileName;
      res.send('Word document created successfully.');
    } catch (error) {
      res.status(500).send(`Error creating Word document: ${error.message}`);
    }


  }

  
  /*
  @Post(':id/answer/:answerId')
  async addAnswerToUser(@Param('id') userId: number, @Param('answerId') answerId: number) {
    const user= await this.userService.addAnswerToUser(userId, answerId);
    return user;
  }

  @Get(':id/answers')
  async getAnswersToUser(@Param('id') userId: number){
    const answers= await this.userService.getAnswersToUser(userId);
    return answers;
  }

  
  @Delete(':id/answers')
  async clearAnswers(@Param('id') userId: number){
    await this.userService.deleteAnswersToUser(userId);
  }

  */

}


