/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PDFDoc } from './document.entity';
import { RegularUser } from 'src/user/regularU.entity';
import * as PDFDocument from 'pdfkit';
import { DocumentPdfDto } from './dto/document-pdf.dto';

@Injectable()
export class PDFDocumentService {
  constructor(
    @InjectRepository(PDFDoc)
    private pdfRepository: Repository<PDFDoc>,
    @InjectRepository(RegularUser)
    private userRepository: Repository<RegularUser>, 
  ) {}

  async createPdf(dto: DocumentPdfDto): Promise<PDFDoc> {
    const user = await this.userRepository.findOneBy({ id: dto.userId });
    if (!user) {
      throw new Error('User not found');
    }

    const doc = new PDFDocument({ bufferPages: true });
    let pdfBuffer = Buffer.alloc(0);

    doc.font('Helvetica').fontSize(12).text(dto.content, {
      align: 'justify',
      indent: 30,
      height: 300,
      ellipsis: true
    });

    doc.end();

    doc.on('data', (chunk) => {
      pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
    });

    return new Promise((resolve, reject) => {
      doc.on('end', async () => {
        const pdf = this.pdfRepository.create({
          id: 0,
          userId: user.id, 
          content: pdfBuffer,
          creationDate: new Date(),
          modifyDate: dto.modifyDate,
          permissions: dto.permissions,
        });

        try {
          const savedPdf = await this.pdfRepository.save(pdf);
          resolve(savedPdf[0]); // Return the first element of the array
        } catch (error) {
          reject(error);
        }
      });

      doc.on('error', reject);
    });
  }

  async deletePdf(pdfId: number): Promise<void> {
    const pdf = await this.pdfRepository.findOneBy({ id: pdfId });
    if (!pdf) {
      throw new Error('PDF not found');
    }

    await this.pdfRepository.delete(pdfId);
  }
/*
  async getPdfById(id: number): Promise<PDFDoc | null> {
    return await this.pdfRepository.findOneBy({ id });
  }
  */


}
