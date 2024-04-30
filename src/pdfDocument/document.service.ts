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


  async createPdf(dto: DocumentPdfDto,texto: string): Promise<PDFDoc> {
    const user = await this.userRepository.findOneBy({ id: dto.userId });
    if (!user) {
        throw new Error('User not found');
    }


    const doc = new PDFDocument({ bufferPages: true });
    let pdfBuffer: Buffer = Buffer.alloc(0);
  
    doc.font('Helvetica').fontSize(12).text(texto, {
      align: 'justify'
    });
  
    doc.on('data', (chunk: Buffer) => {
        pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
    });

    return new Promise((resolve, reject) => {
        doc.on('end', async () => {
            const pdf = this.pdfRepository.create({
                userId: user.id,
                content: pdfBuffer,
                creationDate: new Date(),
                modifyDate: new Date(),
            });

            try {
                const savedPdf = await this.pdfRepository.save(pdf);
                resolve(savedPdf);
            } catch (error) {
                reject(error);
            }
        });

        doc.on('error', (error) => {
            reject(error);
        });

        doc.end();
    });
}

  



   async deletePdf(pdfId: number): Promise<void> {
    const pdf = await this.pdfRepository.findOneBy({ id: pdfId });
    if (!pdf) {
      throw new Error('PDF not found');
    }

    await this.pdfRepository.delete(pdfId);
  }



  async updatePdf(id_pdf: number,texto: string): Promise<PDFDoc> {
    const existingPdf = await this.pdfRepository.findOneBy({ id: id_pdf });
    if (!existingPdf) {
      throw new Error('PDF not found');
    }

    const doc = new PDFDocument({ bufferPages: true });
    let pdfBuffer = Buffer.alloc(0);

    doc.font('Helvetica').fontSize(12).text(texto, {
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
        existingPdf.content = pdfBuffer;
        existingPdf.modifyDate = new Date();
     
        try {
          const updatedPdf = await this.pdfRepository.save(existingPdf);
          resolve(updatedPdf);
        } catch (error) {
          reject(error);
        }
      });

      doc.on('error', reject);
    });
  }


  async downloadPdf(id: number): Promise<Buffer | null > {
    const pdf = await this.pdfRepository.findOneBy({ id });
    if (!pdf) {
      throw new Error('PDF not found');
    }

   
    return pdf.content; 

}


}

