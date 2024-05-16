import { Injectable } from '@nestjs/common';
import { AlignmentType, Document, Footer, Header, Packer, PageNumber, Paragraph, TextRun, ImageRun, Table, TableCell, TableRow, WidthType,BorderStyle } from 'docx';
import * as fs from 'fs';
import * as libre from 'libreoffice-convert';
import * as path from 'path';
import { DocuDto } from './dto/wordDocu.dto';

@Injectable()
export class WordService {
  async generateWordDocumentFromJSON(jsonData: DocuDto): Promise<{ wordBuffer: Buffer; fileName: string }> {
    if (!jsonData) {
      throw new Error('The provided JSON does not have the expected structure.');
    }

    const doc = new Document({
      sections: [
        {
          headers: {
            default: this.createEmptyHeader(),
          },
          footers: {
            default: this.createFooterUso(),
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: jsonData.nombreEmpresa,
                  bold: true,
                  size: '20pt',
                }),
              ],
              spacing: {
                after: 1300,
              },
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: fs.readFileSync('logo/dlt_logo.png'),
                  transformation: {
                    width: 457,
                    height: 168,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
           
           
            this.createChangeLogTable(jsonData),

            new Paragraph({
              text: 'Lista de distribución',
              spacing: { before: 400, after: 200 },
              alignment: AlignmentType.CENTER,
            }),
            this.createDistributionListTable(jsonData),
          ],
        },
        {
          headers: {
            default: this.createHeader(),
          },
          footers: {
            default: this.createFooter(),
          },
          children: [
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    const fileName = jsonData.nombreEmpresa.replace(/[^a-zA-Z0-9]/g, '_');

    return { wordBuffer: buffer, fileName };
  }

  createFooterUso(): Footer {
    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: 'USO INTERNO',
              size: '11pt',
            }),
          ],
        }),
      ],
    });

    return footer;
  }

  createFooter(): Footer {
    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              children: [PageNumber.CURRENT],
            }),
          ],
        }),
      ],
    });

    return footer;
  }

  createHeader(): Header {
    const header = new Header({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'NUM-REFERENCIA',
              size: '8pt',
            }),
          ],
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({
          children: [
            new ImageRun({
              data: fs.readFileSync('logo/dlt_logo.png'),
              transformation: {
                width: 50,
                height: 18,
              },
            }),
            new TextRun({
              text: '\t\t\t\t\t            Política del Sistema de Gestión de la Seguridad de la Información',
              size: '8pt',
            }),
          ],
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Uso Interno',
              size: '8pt',
            }),
          ],
          alignment: AlignmentType.RIGHT,
        }),
      ],
    });

    return header;
  }

  createEmptyHeader(): Header {
    const header = new Header({
      children: [],
    });

    return header;
  }

  async convertWordToPdf(wordFilePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const extend = '.pdf';
      const outputPath = path.join(wordFilePath, extend);

      fs.readFile(wordFilePath, (err, data) => {
        if (err) {
          reject(`Error reading Word file: ${err.message}`);
        }

        libre.convert(data, extend, undefined, (err, done) => {
          if (err) {
            reject(`Error converting Word to PDF: ${err.message}`);
          }

          resolve(done);
        });
      });
    });
  }

  createChangeLogTable(data: DocuDto): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Nombre del documento')],
              width: { size: 50, type: WidthType.AUTO },
            }),
            new TableCell({
              children: [new Paragraph(data.nombreEmpresa || '')],
              width: { size: 50, type: WidthType.AUTO },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Referencia')],
              width: { size: 50, type: WidthType.AUTO },
            }),
            new TableCell({
              children: [new Paragraph('XXXXXXXXXX')],
              width: { size: 50, type: WidthType.AUTO },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Versión')],
              width: { size: 50, type: WidthType.AUTO },
            }),
            new TableCell({
              children: [new Paragraph('1.0')],
              width: { size: 50, type: WidthType.AUTO },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Realizado por')],
              width: { size: 50, type: WidthType.AUTO },
            }),
            new TableCell({
              children: [new Paragraph(data.realizadoPor || '')],
              width: { size: 50, type: WidthType.AUTO },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Revisado por')],
              width: { size: 50, type: WidthType.AUTO },
            }),
            new TableCell({
              children: [new Paragraph(data.revisadoPor || '')],
              width: { size: 50, type: WidthType.AUTO },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Aprobado por')],
              width: { size: 50, type: WidthType.AUTO },
            }),
            new TableCell({
              children: [new Paragraph(data.aprobadoPor || '')],
              width: { size: 50, type: WidthType.AUTO },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Fecha')],
              width: { size: 50, type: WidthType.AUTO },
            }),
            new TableCell({
              children: [new Paragraph('99/99/9999')],
              width: { size: 50, type: WidthType.AUTO },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Estado')],
              width: { size: 50, type: WidthType.AUTO },
            }),
            new TableCell({
              children: [new Paragraph(data.estado || '')],
              width: { size: 50, type: WidthType.AUTO },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Clasificación')],
              width: { size: 50, type: WidthType.AUTO },
            }),
            new TableCell({
              children: [new Paragraph('Uso interno')],
              width: { size: 50, type: WidthType.AUTO },
            }),
          ],
        }),
      ],

      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },

     
    });
  }
  createDistributionListTable(data: DocuDto): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Áreas / Departamentos',
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: {
                fill: 'D9E2F3', // Fondo azul claro
              },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.nombreEmpresa,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      },
    });
  }
  
  
}
  