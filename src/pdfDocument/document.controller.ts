import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
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

    @Put(':id')
    async editPdf(@Param('id') id: number,@Body() DocumentPdfDto){
      return this.pdfService.updatePdf(id,DocumentPdfDto);

    }

    @Get(':id')
    async getPdfById(@Param('id') id: number){
     const pdf= await this.pdfService.getPdfById(id);
     return pdf;
    }


}