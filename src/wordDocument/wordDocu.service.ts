import { Injectable } from '@nestjs/common';
import { AlignmentType, Document, Footer, Header, Packer, PageNumber, Paragraph, TextRun, ImageRun} from 'docx';
import * as fs from 'fs';
import * as libre from 'libreoffice-convert';
import * as path from 'path';

@Injectable()
export class WordService {
  async generateWordDocumentFromJSON(
    jsonData: any,
  ): Promise<{ wordBuffer: Buffer; fileName: string }> {
    if (
      !jsonData ||
      !jsonData.titulo_principal ||
      !jsonData.preguntas_respuestas
    ) {
      throw new Error(
        'The provided JSON does not have the expected structure.',
      );
    }

    const { titulo_principal, preguntas_respuestas } = jsonData;

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
                  text: titulo_principal,
                  bold: true,
                  size: `20pt`,
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
            ...preguntas_respuestas.flatMap(({ pregunta, respuesta }) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Question: ${pregunta}`,
                    bold: true,
                    size: `12pt`,
                  }),
                ],
                spacing: {
                  before: 250,
                  after: 50,
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Answer: ${respuesta}`,
                    size: `11pt`,
                  }),
                ],
              }),
            ]),
          ],
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);

    const fileName = titulo_principal.replace(/[^a-zA-Z0-9]/g, '_');

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
              size: `11pt`,
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
              size: `8pt`,
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
              size: `8pt`,
            }),
          ],
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Uso Interno',
              size: `8pt`,
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
}
