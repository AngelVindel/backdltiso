import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { PDFDocumentService } from "./document.service";
import { DocumentPdfDto } from "./dto/document-pdf.dto";
import { Response } from 'express';


@Controller('pdf')
export class PDFDocumentCotroller{
    
    constructor(private pdfService: PDFDocumentService) {}

   // @UseGuards(JwtAuthGuard)
    @Post()
    createPdf(@Body() dto: DocumentPdfDto) {
     
      return this.pdfService.createPdf(dto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePdf(@Param('id') id: number) {
      await this.pdfService.deletePdf(id);
    }

    @Put(':id')
    async editPdf(@Param('id') id: number,@Body() dto:DocumentPdfDto){
      return this.pdfService.updatePdf(id,dto);

    }
    @Get(':id/download')
async downloadPdf(@Param('id') id: number, @Res() res:Response) {
  try {
    const content = await this.pdfService.downloadPdf(id);
    if (!content) {
      throw new NotFoundException('PDF not found.');
    }
    
    if (!(content instanceof Buffer)) {
      throw new Error('Expected content to be a Buffer');
    }

    console.log("Buffer check:", content instanceof Buffer);  
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="dlt_document.pdf"`);
    res.end(content);
    
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

   