import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { PDFDocumentService } from "./document.service";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as PDFDocument from 'pdfkit';
import { DocumentPdfDto } from "./dto/document-pdf.dto";


@Controller('pdf')
export class PDFDocumentCotroller{
    
    constructor(private readonly pdfService: PDFDocumentService) {}

    @UseGuards(JwtAuthGuard)
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
    async editPdf(@Param('id') id: number,@Body() DocumentPdfDto){
      return this.pdfService.updatePdf(id,DocumentPdfDto);

    }
    @Get(':id/download')
    async downloadPdf(@Param('id') id: number, @Res() res) {
      try {
        const content = await this.pdfService.downloadPdf(id);
        if (!content) {
          throw new NotFoundException('PDF not found.');
        }
    
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="dlt_document.pdf"`);
        res.end(content); 
      } catch (error) {
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Error dowloading PDF';
    
        if (error instanceof NotFoundException) {
          statusCode = HttpStatus.NOT_FOUND;
          message = error.message;
        } else if (error instanceof ForbiddenException) {
          statusCode = HttpStatus.FORBIDDEN;
          message = error.message;
        }
    
        res.status(statusCode).send(message);
      }
    }
    
  }
