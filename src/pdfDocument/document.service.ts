// src/pdf/pdf.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PDFDoc } from './document.entity';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit'; 

@Injectable()
export class PDFDocumentService {
  constructor(
    @InjectRepository(PDFDoc)
    private pdfRepository: Repository<PDFDoc>,
  ) {}

  async createPdf(userId: number, content: string): Promise<PDFDoc> {

    const doc = new PDFDocument();
    const filePath = `./storage/pdfs/${userId}-${Date.now()}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));
   
    doc.font('Helvetica').fontSize(12).text(content, {
        align: 'justify',
        indent: 30,
        height: 300,
        ellipsis: true
      });

    doc.end();



    const pdf = this.pdfRepository.create({creationDate: new Date(Date.now()), userId, filePath });
    await this.pdfRepository.save(pdf);

    return pdf;
  }

  async deletePdf(pdfId: number): Promise<void> {
    const pdf = await this.pdfRepository.findOneBy({ id: pdfId });
    if (!pdf) {
      throw new Error('PDF not found');
    }

    if (fs.existsSync(pdf.filePath)) {
      fs.unlinkSync(pdf.filePath);
    }

    await this.pdfRepository.delete(pdfId);
  }

}
