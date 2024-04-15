import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { PDFDocumentService } from "./document.service";
import { DocumentPdfDto } from "./dto/document-pdf.dto";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('pdf')
export class PDFDocumentCotroller{
    
    constructor(private readonly pdfService: PDFDocumentService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    createPdf(@Req() req,@Body() DocumentPdfDto) {
      const userId=req.user.userId;
      const documentPdfDto = { ...DocumentPdfDto, userId };
  
      return this.pdfService.createPdf(documentPdfDto);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePdf(@Param('id') id: number) {
      await this.pdfService.deletePdf(id);
    }
/*
    @Get(':id')
    async getPdf(@Param('id') id: number, @Res() response: Response) {
      const pdf = await this.pdfService.getPdfById(id);
      if (!pdf) {
        throw new NotFoundException('PDF not found');
      }
      response.headers.set('Content-Type', 'application/pdf');
      response.headers.set('Content-Disposition', `inline; filename="${id}.pdf"`);
      response.end(pdf.content, 'binary');
    }
  */


}