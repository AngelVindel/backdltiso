import { Injectable } from '@nestjs/common';
import {
  AlignmentType,
  Document,
  Footer,
  Header,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableCell,
  TableRow,
  WidthType,
  BorderStyle,
  IParagraphOptions,
  HeadingLevel,
  UnderlineType,
  TableOfContents,
} from 'docx';
import * as fs from 'fs';
import * as libre from 'libreoffice-convert';
import * as path from 'path';
import { DocuDto } from './dto/wordDocu.dto';

@Injectable()
export class WordService {
  async generateWordDocumentFromJSON(
    jsonData: DocuDto,
  ): Promise<{ wordBuffer: Buffer; fileName: string }> {
    if (!jsonData) {
      throw new Error(
        'The provided JSON does not have the expected structure.',
      );
    }

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'Heading3',
            name: 'Heading 3',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: '28pt',
              bold: true,
            },
            paragraph: {
              spacing: {
                after: 120,
              },
            },
          },
          {
            id: 'indice',
            name: 'Índice',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: '16pt',
              color: '808080',
              underline: {
                type: UnderlineType.SINGLE,
                color: '000000',
              },
            },
            paragraph: {
              indent: { left: '7cm', hanging: '8cm' },
              spacing: { before: 6 },
            },
          },
        ],
      },
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
              heading: HeadingLevel.TITLE,
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
              spacing: {
                after: 2000,
              },
              alignment: AlignmentType.CENTER,
            }),
            this.createChangeLogTable(jsonData),
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
            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),

            new Paragraph({
              text: 'Registro de cambios del documento',
              spacing: { before: 400, after: 200 },
              alignment: AlignmentType.CENTER,
            }),
            this.createChangesDocument(jsonData),

            new Paragraph({
              text: 'Lista de distribución',
              spacing: { before: 400, after: 200 },
              alignment: AlignmentType.CENTER,
            }),
            this.createDistributionListTable(jsonData),

            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'INDICE\t\t\t\t\t\t\t\t\n',
                  underline: {
                    type: UnderlineType.SINGLE,
                  },
                  size: '16pt',
                }),
              ],
              spacing: { before: 400, after: 200 },
              alignment: AlignmentType.RIGHT,
              heading: HeadingLevel.HEADING_1,
              style: 'indice',
            }),
            new TableOfContents('Contenido', {
              hyperlink: true,
              headingStyleRange: '1-2',
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'INDICE DE TABLAS\t\t\t\t\t\t\t\t\n',
                  size: '16pt',
                }),
              ],
              spacing: { before: 400, after: 200 },
              alignment: AlignmentType.RIGHT,
              style: 'indice',
            }),
            new TableOfContents('Contenido', {
              hyperlink: true,
              headingStyleRange: '3-6',
            }),

            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),
            ...this.createSection(
              '1. Introducción',
              [
                'La Política de Seguridad de la Información (en adelante, Política) persigue la adopción de un conjunto de medidas destinadas a preservar la confidencialidad, integridad y disponibilidad de la información, que constituyen los tres componentes básicos de la seguridad de la información, y tiene como objetivo establecer los requisitos para proteger la información, los equipos y servicios tecnológicos que sirven de soporte para la mayoría de los procesos de negocio de NOMBRE_EMPRESA.',
                'Esta Política de Seguridad de la Información es la pieza angular por la que se rige la normativa de seguridad de NOMBRE_EMPRESA, esta normativa la conforman los requerimientos, directrices y procedimientos que debe seguir NOMBRE_EMPRESA en materia de seguridad.',
                'En la actualidad, las tecnologías de la información se enfrentan a un creciente número de amenazas, lo cual requiere de un esfuerzo constante por adaptarse y gestionar los riesgos introducidos por estas.',
              ],
              jsonData.nombreEmpresa,
            ),
            ...this.createSection(
              '2. Objetivo',
              [
                'El objetivo principal de la presente Política de alto nivel es definir los principios y las reglas básicas para la gestión de la seguridad de la información. El fin último es lograr que NOMBRE_EMPRESA garantice la seguridad de la información y minimicen los riesgos de naturaleza no financiera derivados de un impacto provocado por una gestión ineficaz de la misma.',
              ],
              jsonData.nombreEmpresa,
            ),
            ...this.createSection(
              '3. Alcance de la política',
              [
                'Esta política de seguridad de la información es aplicable a todos los empleados, contratistas, y terceros que tengan acceso, manejen, procesen o almacenen activos de información pertenecientes a NOMBRE_EMPRESA. Se extiende específicamente a cualquier entidad externa que trabaje en nombre de NOMBRE_EMPRESA, incluyendo proveedores de servicios, socios comerciales y consultores que puedan tener acceso a sistemas de información, datos sensibles o infraestructura crítica de la organización.',
                'Es imperativo que todos los terceros comprometidos con NOMBRE_EMPRESA cumplan con esta política y sus procedimientos asociados, asegurando así la integridad, confidencialidad y disponibilidad de nuestra información corporativa y personal de clientes, conforme a los estándares establecidos por la norma ISO/IEC 27001 y otros requisitos regulatorios y legales pertinentes.',
                'Su vigencia se inicia en el día de su firma y aprobación.',
              ],
              jsonData.nombreEmpresa,
            ),

            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),
            ...this.createSection(
              '4. Roles y responsabilidades',
              [
                `La Dirección de NOMBRE_EMPRESA, consciente de la importancia de la seguridad de la información para llevar a cabo con éxito sus objetivos de negocio, se compromete a:`,
                {
                  text: 'Promover en la organización las funciones y responsabilidades en el ámbito de seguridad de la información.',
                  bullet: {
                    level: 0,
                  },
                },
                {
                  text: 'Facilitar los recursos adecuados para alcanzar los objetivos de seguridad de la información.',
                  bullet: {
                    level: 0,
                  },
                },
                {
                  text: 'Impulsar la divulgación y la concienciación de la Política de Seguridad de la Información entre los empleados de NOMBRE_EMPRESA.',
                  bullet: {
                    level: 0,
                  },
                },
                {
                  text: 'Exigir el cumplimiento de la Política, de la legislación vigente y de los requisitos de los reguladores en el ámbito de la seguridad de la información.',
                  bullet: {
                    level: 0,
                  },
                },
                {
                  text: 'Considerar los riesgos de seguridad de la información en la toma de decisiones.',
                  bullet: {
                    level: 0,
                  },
                },
                `NOMBRE_EMPRESA se compromete a velar por la Seguridad de todos los activos bajo su responsabilidad mediante las medidas que sean necesarias, siempre garantizando el cumplimiento de las distintas normativas y leyes aplicables.`,
                `NOMBRE_EMPRESA deberá nombrar una figura responsable de definir, implementar y monitorizar las medidas de ciberseguridad y seguridad de la información. Esta figura deberá establecerse desde un entorno de gobierno y gestión, será independiente de cualquier área organizativa reportando al órgano de gobierno o en su defecto a su comisión de auditoría y tendrá entre sus funciones y responsabilidades el aplicar principios de segregación de funciones y el contacto con las autoridades y grupos de interés especiales en materia de seguridad de la información.`,
                `La figura asumirá las funciones que, con carácter general, sean atribuidas por la presente Política de Seguridad de la Información a dicha figura.`,
                `Será su responsabilidad desarrollar y mantener la Política, asegurándose que ésta sea adecuada y oportuna según evolucione tanto la empresa.`,
              ],
              jsonData.nombreEmpresa,
            ),
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
              text: '\t\t\t\t\t             Política del Sistema de Gestión de la Seguridad de la Información',
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
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.realizadoPor || '',
                      highlight: 'yellow',
                    }),
                  ],
                }),
              ],
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
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.revisadoPor || '',
                      highlight: 'yellow',
                    }),
                  ],
                }),
              ],
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
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.aprobadoPor || '',
                      highlight: 'yellow',
                    }),
                  ],
                }),
              ],
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
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '99/99/9999',
                      highlight: 'yellow',
                    }),
                  ],
                }),
              ],
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
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.estado || '',
                      highlight: 'yellow',
                    }),
                  ],
                }),
              ],
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
                  alignment: AlignmentType.JUSTIFIED,
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
        insideHorizontal: {
          style: BorderStyle.SINGLE,
          size: 1,
          color: '000000',
        },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      },
    });
  }
  createChangesDocument(data: DocuDto): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Versión', bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                fill: 'D9E2F3',
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Fecha', bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                fill: 'D9E2F3',
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Autor', bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                fill: 'D9E2F3',
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Aprobado', bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                fill: 'D9E2F3',
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Descripción', bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                fill: 'D9E2F3',
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
                      text: '1.0',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: '99/99/9999', highlight: 'yellow' }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.nombreEmpresa,
                      highlight: 'yellow',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Comité Seguridad',
                      highlight: 'yellow',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Documento original',
                    }),
                  ],
                  alignment: AlignmentType.JUSTIFIED,
                }),
              ],
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
  createSection(
    title: string,
    content: (string | IParagraphOptions)[],
    nombreEmpresa: string,
  ): Paragraph[] {
    const sectionTitle = new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: '16pt', // 16pt
          color: '808080', // Color grisáceo
        }),
      ],
      spacing: {
        after: 200,
      },
      alignment: AlignmentType.LEFT,
      heading: HeadingLevel.HEADING_1,
      border: {
        bottom: {
          color: '000000',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6, // 0.5pt
        },
      },
    });

    const sectionContent = content.map((item) => {
      if (typeof item === 'string') {
        return new Paragraph({
          text: item.replace(/NOMBRE_EMPRESA/g, nombreEmpresa), // Reemplazar NOMBRE_EMPRESA con el nombre de la empresa
          spacing: {
            after: 200,
          },
          alignment: AlignmentType.JUSTIFIED,
        });
      } else {
        const updatedItem = { ...item };
        if (updatedItem.text) {
          updatedItem.text = updatedItem.text.replace(
            /NOMBRE_EMPRESA/g,
            nombreEmpresa,
          );
        }
        return new Paragraph(updatedItem);
      }
    });

    return [sectionTitle, ...sectionContent];
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
