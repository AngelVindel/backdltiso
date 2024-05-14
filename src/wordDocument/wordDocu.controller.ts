import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { WordService } from './wordDocu.service';
import * as fs from 'fs';

@Controller('word')
export class WordController {
  private createdWordFileName: string = '';

  constructor(private readonly wordService: WordService) {}

  @Post('create')
  async createWordDocument(
    @Body() createData: any,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { wordBuffer, fileName } =
        await this.wordService.generateWordDocumentFromJSON(createData);
      const filePath = `src/Documentos/${fileName}.docx`; // Corrección: Agregar comillas invertidas para interpolación de cadenas
      fs.writeFileSync(filePath, wordBuffer);

      this.createdWordFileName = fileName;

      res.send('Word document created successfully.');
    } catch (error) {
      res.status(500).send(`Error creating Word document: ${error.message}`); // Corrección: Agregar comillas invertidas para interpolación de cadenas
    }
  }

  @Post('toPDF')
  async convertToPDF(@Res() res: Response): Promise<void> {
    try {
      if (!this.createdWordFileName) {
        throw new Error('No Word document has been created.');
      }

      const wordFilePath = `src/Documentos/${this.createdWordFileName}.docx`; 

      const pdfBuffer = await this.wordService.convertWordToPdf(wordFilePath);

      const pdfFilePath = `src/Documentos/${this.createdWordFileName}.pdf`; 
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
