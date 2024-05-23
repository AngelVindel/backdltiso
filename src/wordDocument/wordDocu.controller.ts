import { Controller, Post, Body, Res, Param, Delete } from '@nestjs/common';
import { Response } from 'express';
import { WordService } from './wordDocu.service';
import * as fs from 'fs';
import { DocuDto } from './dto/wordDocu.dto';
import { WordService2 } from './wordDocu2.service';

@Controller('word')
export class WordController {
  private createdWordFileName: string = '';

  constructor(private readonly wordServicePSI: WordService,
    private readonly wordServiceSGSI: WordService2
    ) {}


    @Post('create/psi')
    async createWordDocumentPSI(
      @Body() createData: DocuDto,
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

  @Delete('psi/:id')
  async deleteWord(@Param('id') id:number){
    await this.wordServicePSI.deleteWord(id)
  }

  @Post('create/sgsi')
  async createWordDocumentSGSI(
    @Body() createData: DocuDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { wordBuffer, fileName } =
        await this.wordServiceSGSI.generateWordDocumentSGSI(createData);
      const filePath = ` ../../../../../../Downloads/${fileName}.docx`; 
      fs.writeFileSync(filePath, wordBuffer);

      this.createdWordFileName = fileName;

      res.send('Word document created successfully.');
    } catch (error) {
      res.status(500).send(`Error creating Word document: ${error.message}`);
    }
  }

  @Post('toPDF')
  async convertToPDF(@Res() res: Response): Promise<void> {
    try {
      if (!this.createdWordFileName) {
        throw new Error('No Word document has been created.');
      }

      const wordFilePath = ` ../../../../../../Downloads/${this.createdWordFileName}.docx`; 

      const pdfBuffer = await this.wordServicePSI.convertWordToPdf(wordFilePath);

      const pdfFilePath = ` ../../../../../../Downloads/${this.createdWordFileName}.pdf`; 
      fs.writeFileSync(pdfFilePath, pdfBuffer);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${this.createdWordFileName}.pdf`, 
      );

      res.send(pdfBuffer);

      console.log('PDF created successfully.');
    } catch (error) {
      res
        .status(500)
        .send(`Error converting document to PDF: ${error.message}`); 
    }
  }
}
