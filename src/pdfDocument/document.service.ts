/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PDFDoc } from './document.entity';
import { RegularUser } from 'src/user/regularU.entity';
import * as PDFDocument from 'pdfkit';
import { DocumentPdfDto } from './dto/document-pdf.dto';
import axios from 'axios';

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
    const	text=`Este documento proporciona un análisis exhaustivo de las respuestas obtenidas de ${user.username} a través del reciente cuestionario destinado a evaluar la conformidad de la empresa ${user.company}  con la norma ISO 27001. La norma ISO 27001 es un marco reconocido internacionalmente para la gestión de la seguridad de la información, que ofrece un enfoque sistemático y estructurado para asegurar la confidencialidad, integridad y disponibilidad de la información corporativa.`
    const doc = new PDFDocument({ margin: 50, bufferPages: true });
    let pdfBuffer: Buffer = Buffer.alloc(0);

    // Añadir imagen de logo de la empresa
    doc.image('logo/dlt_logo.png', 460, 20, { width: 100 }).moveDown(2);

    // Añadir fecha de creación semi-transparente
    doc.fontSize(10)
      .text(`Fecha: ${dto.creationDate.toLocaleDateString()}`, 440, 80, { align: 'right' })
      .fontSize(25)
      .font('Helvetica-Bold')
      .text('ISO 27001', 50, 40)
      .moveDown(0.5);
      
    // Texto introductorio y secciones de contenido
    doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('Introducción', { align: 'left' })
      .moveDown(0.5);

    doc.fontSize(12)
      .font('Helvetica')
      .text(text, {
        align: 'justify',
        indent: 30
      })
      .moveDown(1);
      if (doc.y > 700) {
        doc.addPage();
    }
      doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('Políticas Recomendadas')
      .moveDown(0.5);

    doc.fontSize(12)
      .font('Helvetica')
      .text(dto.recommended_p, {
        align: 'justify',
        indent: 30
      })
      .moveDown(1);
      doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('Procedimientos Generados')
      .moveDown(0.5);

      if (doc.y > 700) {
        doc.addPage();
    }

    doc.fontSize(12)
      .font('Helvetica')
      .text(dto.generated_p, {
        align: 'justify',
        indent: 30
      })
      .moveDown(1);
      if (doc.y > 700) {
        doc.addPage();
    }
      doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('Riesgos y recomendaciones')
      .moveDown(0.5);

      if (doc.y > 700) {
        doc.addPage();
    }

    doc.fontSize(12)
      .font('Helvetica')
      .text(dto.risk_recomenmended, {
        align: 'justify',
        indent: 30
      })
      .moveDown(1);

      if (doc.y > 650) {
        doc.addPage();
    }
    // Espacio adicional antes de los gráficos
    doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('Gráficos', { align: 'left' })
      .moveDown(0.5);
      if (doc.y > 700) {
        doc.addPage();
    }

    // Variables para manejar las posiciones de los gráficos
    let yPosition = doc.y;
    let rightColumnX = 300; // Espacio para la columna derecha

    // Primer gráfico (Riesgo inherente)
    const riskChartImageUrl = await this.getRiskChartUrl();
    const response = await axios.get(riskChartImageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
  
    doc.image(imageBuffer, 50, yPosition, { width: 250 });
    if (doc.y > 700) {
      doc.addPage();
  }
    // Segundo gráfico (Comparación de riesgo)
    const riskCompareChartImageUrl2 = await this.getRiskComparisonChartUrl();
    const response2 = await axios.get(riskCompareChartImageUrl2, { responseType: 'arraybuffer' });
    const imageBuffer2 = Buffer.from(response2.data, 'binary');
  
    doc.image(imageBuffer2, rightColumnX, yPosition, { width: 250 });

    if (doc.y > 700) {
      doc.addPage();
  }
   
    // Actualizar yPosition para el próximo gráfico debajo de estos dos
    yPosition += 180;  // Ajusta según el tamaño de tus gráficos

    // Tercer gráfico (Tratamiento del riesgo)
    const riskTreatmentChartImageUrl3 = await this.getRiskTreatmentChartUrl();
    const response3 = await axios.get(riskTreatmentChartImageUrl3, { responseType: 'arraybuffer' });
    const imageBuffer3 = Buffer.from(response3.data, 'binary');
  
    doc.image(imageBuffer3, 150, yPosition, { width: 250 });  // Centrado debajo de los dos primeros

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



  async updatePdf(id_pdf: number,dto: DocumentPdfDto): Promise<PDFDoc> {
    const existingPdf = await this.pdfRepository.findOneBy({ id: id_pdf });
    if (!existingPdf) {
      throw new Error('PDF not found');
    }
    const user = await this.userRepository.findOneBy({ id: dto.userId });
    if (!user) {
        throw new Error('User not found');
    }
    const modifyD =new Date();
    const	text=`Este documento proporciona un análisis exhaustivo de las respuestas obtenidas de Manolo a través del reciente cuestionario destinado a evaluar la conformidad de la empresa Bomobo  con la norma ISO 27001. La norma ISO 27001 es un marco reconocido internacionalmente para la gestión de la seguridad de la información, que ofrece un enfoque sistemático y estructurado para asegurar la confidencialidad, integridad y disponibilidad de la información corporativa.`
    const doc = new PDFDocument({ margin: 50, bufferPages: true });
    let pdfBuffer: Buffer = Buffer.alloc(0);

    doc.image('logo/dlt_logo.png', 460, 20, { width: 100 }).moveDown(2);

    doc.fontSize(10)
      .text(`Fecha: ${modifyD.toLocaleDateString()}`, 440, 80, { align: 'right' })
      .fontSize(25)
      .font('Helvetica-Bold')
      .text('ISO 27001', 50, 40)
      .moveDown(0.5);
      
    doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('Introducción', { align: 'left' })
      .moveDown(0.5);

    doc.fontSize(12)
      .font('Helvetica')
      .text(text, {
        align: 'justify',
        indent: 30
      })
      .moveDown(1);
      if (doc.y > 700) {
        doc.addPage();
    }
      doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('Políticas Recomendadas')
      .moveDown(0.5);

    doc.fontSize(12)
      .font('Helvetica')
      .text(dto.recommended_p, {
        align: 'justify',
        indent: 30
      })
      .moveDown(1);
      doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('Procedimientos Generados')
      .moveDown(0.5);

      if (doc.y > 700) {
        doc.addPage();
    }

    doc.fontSize(12)
      .font('Helvetica')
      .text(dto.generated_p, {
        align: 'justify',
        indent: 30
      })
      .moveDown(1);
      if (doc.y > 700) {
        doc.addPage();
    }
      doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('Riesgos y recomendaciones')
      .moveDown(0.5);

      if (doc.y > 700) {
        doc.addPage();
    }

    doc.fontSize(12)
      .font('Helvetica')
      .text(dto.risk_recomenmended, {
        align: 'justify',
        indent: 30
      })
      .moveDown(1);

      if (doc.y > 650) {
        doc.addPage();
    }
    doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('Gráficos', { align: 'left' })
      .moveDown(0.5);
      if (doc.y > 700) {
        doc.addPage();
    }

    let yPosition = doc.y;
    let rightColumnX = 300; 

    const riskChartImageUrl = await this.getRiskChartUrl();
    const response = await axios.get(riskChartImageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
  
    doc.image(imageBuffer, 50, yPosition, { width: 250 });
    if (doc.y > 700) {
      doc.addPage();
  }
    const riskCompareChartImageUrl2 = await this.getRiskComparisonChartUrl();
    const response2 = await axios.get(riskCompareChartImageUrl2, { responseType: 'arraybuffer' });
    const imageBuffer2 = Buffer.from(response2.data, 'binary');
  
    doc.image(imageBuffer2, rightColumnX, yPosition, { width: 250 });

    if (doc.y > 700) {
      doc.addPage();
  }
   
    yPosition += 180;  

    const riskTreatmentChartImageUrl3 = await this.getRiskTreatmentChartUrl();
    const response3 = await axios.get(riskTreatmentChartImageUrl3, { responseType: 'arraybuffer' });
    const imageBuffer3 = Buffer.from(response3.data, 'binary');
  
    doc.image(imageBuffer3, 150, yPosition, { width: 250 });  
    doc.on('data', (chunk) => {
      pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
    });
    

    return new Promise((resolve, reject) => {
      doc.on('end', async () => {
        existingPdf.content = pdfBuffer;
        existingPdf.modifyDate =modifyD;
     
        try {
          const updatedPdf = await this.pdfRepository.save(existingPdf);
          resolve(updatedPdf);
        } catch (error) {
          reject(error);
        }
      });

      doc.on('error', reject);
      doc.end();

    });
  }


  async downloadPdf(id: number): Promise<Buffer | null > {
    const pdf = await this.pdfRepository.findOneBy({ id });
    if (!pdf) {
      throw new Error('PDF not found');
    }

   
    return pdf.content; 

}
private async getRiskChartUrl(): Promise<string> {
  const chartConfig = {
      type: 'bar',
      data: {
        labels: Array.from({ length: 18 }, (_, i) => i + 1),
        datasets: [{
            label: 'Riesgo Inherente',
            data: [15000, 14000, 13000, 12000, 11000, 10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 5000, 6000, 7000],
            backgroundColor: 'rgba(0, 123, 255, 0.6)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          },
          plugins: {
            legend: {
                display: true
            }
      }}
  };

  const baseUrl = 'https://quickchart.io/chart';
  const url = `${baseUrl}?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
  return url;
}
private async getRiskComparisonChartUrl(): Promise<string> {
  const chartConfig = {
      type: 'bar',
      data: {
          labels: Array.from({ length: 18 }, (_, i) => i + 1),
          datasets: [{
              label: 'Riesgo Inherente',
              data: [15000, 14000, 13000, 12000, 11000, 10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 5000, 6000, 7000],
              backgroundColor: 'rgba(0, 123, 255, 0.6)',
              borderColor: 'rgba(0, 123, 255, 1)',
              borderWidth: 1
          }, {
              label: 'Riesgo Residual',
              data: [7000, 6000, 5000, 4000, 3000, 2000, 1000, 5000, 4000, 3000, 2000, 1000, 500, 2500, 3000, 4000, 2000, 1000],
              backgroundColor: 'rgba(255, 159, 64, 0.6)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          },
          plugins: {
              legend: {
                  display: true
              }
          }
      }
  };

  const baseUrl = 'https://quickchart.io/chart';
  const url = `${baseUrl}?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
  return url;
}
private async getRiskTreatmentChartUrl(): Promise<string> {
  const chartConfig = {
      type: 'bar',
      data: {
          labels: ['1', '2', '3', '4'],
          datasets: [{
              label: 'Tratamiento del Riesgo',
              data: [6, 3, 10, 1],
              backgroundColor: [
                  'rgba(0, 123, 255, 0.6)',
                  'rgba(0, 123, 255, 0.6)',
                  'rgba(0, 123, 255, 0.6)',
                  'rgba(0, 123, 255, 0.6)'
              ],
              borderColor: [
                  'rgba(0, 123, 255, 1)',
                  'rgba(0, 123, 255, 1)',
                  'rgba(0, 123, 255, 1)',
                  'rgba(0, 123, 255, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true,
                  ticks: {
                      stepSize: 1 // Ajusta esto según la escala que necesites
                  }
              }
          },
          plugins: {
              legend: {
                  display: false // Oculta la leyenda si es necesario
              }
          }
      }
  };

  const baseUrl = 'https://quickchart.io/chart';
  const url = `${baseUrl}?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
  return url;
}



}

