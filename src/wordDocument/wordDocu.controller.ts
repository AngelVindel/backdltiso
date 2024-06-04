import { Controller, Post, Body, Res, Param, Delete, Put, NotFoundException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { WordService } from './wordDocu.service';
import * as fs from 'fs';
import { DocuDto, UpdateDocuDto } from './dto/wordDocu.dto';
import { WordService2 } from './wordDocu2.service';

@Controller('word')
export class WordController {
  private createdWordFileName: string = '';

  constructor(private readonly wordServicePSI: WordService,
    private readonly wordServiceSGSI: WordService2
    ) {}


    @Post('create/psi')
    async createWordDocumentPSI(
      @Body() createData: DocuDto
    ): Promise<any> {

      const word= await this.wordServicePSI.generateWordDocumentPSI(createData);
     return word;
    }
  
  @Post('download/psi/:id')
  async downloadWordDocumentPSI(
    @Param("id") id:number,
        @Res() res: Response,
  ): Promise<void> {
    try {
      const { wordBuffer, fileName } =
        await this.wordServicePSI.downloadWord(id);
      const filePath = ` ../../../../../../Downloads/${fileName}.docx`; 
      fs.writeFileSync(filePath, wordBuffer);
      this.createdWordFileName = fileName;
      res.send('Word document created successfully.');
    } catch (error) {
      res.status(500).send(`Error creating Word document: ${error.message}`);
    }
  }


  @Put('psi/:id/user/:idUser')
  async updateWordPSI(@Param('idUser') userId:number, @Param('id') documentId: string, @Body() dto: UpdateDocuDto ){
    const word=await this.wordServicePSI.updateUserDocument(userId,parseInt(documentId),dto);
    return word;
  }

  
  @Put('psi/:id/user/buffer/:idUser')
  async updateWordBufferPSI(@Param('idUser') userId:number, @Param('id') documentId: string, @Body() buffer: Buffer ){
    await this.wordServicePSI.updateBufferUserDocument(userId,parseInt(documentId),buffer);
   
  }
  @Delete('psi/:id')
  async deleteWordPSI(@Param('id') id:number){
    await this.wordServicePSI.deleteWord(id)
  }

  
  

  @Post('create/sgsi')
  async createWordDocumentSGSI(
    @Body() createData: DocuDto
  ): Promise<any> {

    const word= await this.wordServiceSGSI.generateWordDocumentSGSI(createData);
   return word;
  }

  @Post('download/sgsi/:id')
  async downloadDocumentSGSI(
    @Param("id") id:number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { wordBuffer, fileName } =
        await this.wordServiceSGSI.downloadWord(id);
      const filePath = ` ../../../../../../Downloads/${fileName}.docx`; 
      fs.writeFileSync(filePath, wordBuffer);

      this.createdWordFileName = fileName;

      res.send('Word document created successfully.');
    } catch (error) {
      res.status(500).send(`Error creating Word document: ${error.message}`);
    }
  }
  
  @Put('sgsi/:id/user/:idUser')
  async updateWordSGSI(@Param('idUser') userId:number, @Param('id') documentId: string, @Body() dto: UpdateDocuDto ){
    const word=await this.wordServiceSGSI.updateUserDocument(userId,parseInt(documentId),dto);
    return word;
  }

  @Put('sgsi/:id/user/buffer/:idUser')
  async updateWordBufferSGSI(@Param('idUser') userId:number, @Param('id') documentId: string, @Body() buffer: Buffer ){
    await this.wordServiceSGSI.updateBufferUserDocument(userId,parseInt(documentId),buffer);
   
  }
  @Delete('sgsi/:id')
  async deleteWordSGSI(@Param('id') id:number){
    await this.wordServiceSGSI.deleteWord(id)
  }


  @Post(':id/download/pdf')
  async convertToPDF(@Res() res: Response, @Param('id') idPdf: number): Promise<void> {
    try {
      const { wordBuffer, fileName } = await this.wordServicePSI.downloadWord(idPdf);

      if (!wordBuffer) {
        throw new NotFoundException('Word not found.');
      }

      const pdfBuffer = await this.wordServicePSI.convertWordToPDF(wordBuffer);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
      res.send(pdfBuffer);

      console.log('PDF created successfully.');
    } catch (error) {
      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Error downloading PDF';
      if (error instanceof NotFoundException) {
        statusCode = HttpStatus.NOT_FOUND;
        message = error.message;
      } else if (error instanceof ForbiddenException) {
        statusCode = HttpStatus.FORBIDDEN;
        message = error.message;
      } else {
        console.error("Error during PDF download:", error);
      }

      res.status(statusCode).send(message);
    }
  }
}


