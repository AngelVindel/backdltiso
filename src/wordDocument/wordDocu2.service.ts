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
export class WordService2 {
  async generateWordDocumentSGSI(
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
            ...this.createSection('1. Introducción', [
                'La Política del Sistema de Gestión de Seguridad de la Información (SGSI) bajo el estándar ISO/IEC 27001 es un documento de alto nivel dentro de una organización que establece el enfoque general de la empresa hacia la seguridad de la información. Es una declaración formal de las intenciones y principios en relación con la gestión de la seguridad de la información, proporcionando un marco para establecer objetivos de seguridad de la información y estableciendo una dirección clara de las prácticas de seguridad a seguir por todos los empleados, contratistas y cualquier otra parte interesada.',
                'Es un documento vivo que se actualiza a medida que cambia el contexto de seguridad de la información de la organización, se identifican nuevos riesgos, o se implementan nuevos controles.'
              ], jsonData.nombreEmpresa),
              
              ...this.createSection('2. Objetivo', [
                'El objetivo principal de una política de Sistema de Gestión de Seguridad de la Información (SGSI) bajo la norma ISO/IEC 27001 es proporcionar un marco de referencia que defina cómo se gestiona la seguridad de la información dentro de la organización.',
                'Esta política establece la dirección, los valores, los principios y las reglas básicas para la gestión de la seguridad de la información, alineándola con los objetivos estratégicos de la empresa.',
                ...[
                  'Establecer el compromiso de la alta dirección con la seguridad de la información.',
                  'Clarificar responsabilidades y roles dentro de la organización en relación con la seguridad de la información.',
                  'Proporcionar un marco para la gestión efectiva de los riesgos de seguridad de la información.',
                  'Asegurar el cumplimiento de todas las leyes, regulaciones y requisitos contractuales aplicables.',
                  'Establecer un enfoque de mejora continua para el SGSI.',
                  'Crear conciencia y proporcionar formación sobre seguridad de la información.',
                  'Proteger la confidencialidad, integridad y disponibilidad de los activos de información.',
                  'Fomentar una cultura organizacional que valore la seguridad de la información.'
                ].map((text, index) => ({
                  text: `${index + 1}. ${text}`,
                  alignment: AlignmentType.LEFT,
                  spacing: { after: 100 }
                })),
              ], jsonData.nombreEmpresa),

              ...this.createSection('3. Alcance del SGSI',[
                'Esta Política se aplica dentro del alcance interno de la norma ISO/IEC 27001, siendo de obligado cumplimiento para todo el personal que, de manera permanente o eventual, preste sus servicios a la compañía.',
                 'Su vigencia se inicia en el día de su firma y aprobación.',
              ], jsonData.nombreEmpresa),

              ...this.createSection(
                '4. Responsabilidades',
                [
                  'COMITÉ DE DIRECCIÓN.',
                  {
                    text: 'Aprobar y proporcionar los recursos necesarios para el desarrollo, implementación y cambios de esta política.',
                    bullet: { level: 0 },
                  },
                  {
                    text: 'Garantizar que estas políticas sean conocidas por todos y apoyar a su divulgación, conocimiento y carácter obligatorio.',
                    bullet: { level: 0 },
                  },
                  '',
                  'RESPONSABLE DE SEGURIDAD.',
                  {
                    text: 'Tener la responsabilidad de supervisar la adecuada ejecución de la presente política.',
                    bullet: { level: 0 },
                  },
                  {
                    text: 'Gestionar la capacitación sobre el contenido de la presente política.',
                    bullet: { level: 0 },
                  },
                  {
                    text: 'Establecer, documentar y distribuir la presente política.',
                    bullet: { level: 0 },
                  },
                  {
                    text: 'Resolver posibles controversias originadas por la política.',
                    bullet: { level: 0 },
                  },
                  {
                    text: 'Gestionar los recursos otorgados para la implementación de la política.',
                    bullet: { level: 0 },
                  },
                  {
                    text: 'Revisión periódica de este documento.',
                    bullet: { level: 0 },
                  },
                  '',
                  'RESPONSABLE DE PRIVACIDAD.',
                  {
                    text: 'Asesorar en leyes de protección de datos y las mejores prácticas.',
                    bullet: { level: 0 },
                  },
                  '',
                  'PROPIETARIO DEL RIESGO',
                  {
                    text: 'Tener responsabilidad de comprender y gestionar los riesgos asociados a un activo.',
                    bullet: { level: 0 },
                  },
                  '',
                  'PROPIETARIO DEL ACTIVO',
                  {
                    text: 'Identificar y documentar los activos dentro de su área de responsabilidad.',
                    bullet: { level: 0 },
                  },
                  {
                    text: 'Asignar un nivel de clasificación a los activos basado en su sensibilidad y valor para la organización.',
                    bullet: { level: 0 },
                  },
                  {
                    text: 'Determinar quién necesita acceso a los activos y en qué nivel.',
                    bullet: { level: 0 },
                  },
                  {
                    text: 'Colaborar en la evaluación de riesgos que afecten a sus activos, ayudando a identificar amenazas y vulnerabilidades potenciales.',
                    bullet: { level: 0 },
                  },
                  {
                    text: 'Informar sobre cualquier incidente de seguridad que afecte a sus activos.',
                    bullet: { level: 0 },
                  },
                  '',
                  'EMPLEADOS.',
                  {
                    text: 'Cumplir con los lineamientos de la presente política, respetando los procedimientos establecidos. Alertar de inmediato sobre incumplimientos a esta política.',
                    bullet: { level: 0 },
                  },
                ],
                jsonData.nombreEmpresa
              ),

              ...this.createSection( '5. Términos y definiciones',
              [
                'En este documento se utilizan los siguientes términos y/o definiciones:',
                {
                  text: 'Activo de Información: Conocimientos o datos que tienen valor para la empresa.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Seguridad de la Información: Preservación de la confidencialidad, integridad y disponibilidad de la información.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Parte interesada: Persona o grupo que tiene un interés en el desempeño o éxito de la organización.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Sistema de Gestión de la Seguridad de la Información (SGSI): Parte del sistema de gestión global, basada en un enfoque hacia los riesgos del negocio, cuyo fin es establecer, implementar, operar, hacer seguimiento, revisar, mantener y mejorar la seguridad de la información.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Riesgo de Seguridad de la Información: Posibilidad que una amenaza explote vulnerabilidades de un activo o de un grupo de activos y por lo tanto cause daño a la Institución.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Autenticidad: Propiedad o característica consistente en que una entidad es quien dice ser o bien que garantiza la fuente de la que proceden los datos.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Confidencialidad: Propiedad o característica consistente en que la información ni se pone a disposición, ni se revela a individuos, entidades o procesos no autorizados.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Integridad: Propiedad o característica consistente en que el activo de información no ha sido alterado de manera no autorizada.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Trazabilidad: Cualidad que permite que todas las acciones realizadas sobre la información o un sistema de tratamiento de la información sean asociadas de modo inequívoco a una persona o entidad.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Disponibilidad: Propiedad o característica de los activos consistente en que las entidades o procesos autorizados tienen acceso a los mismos cuando lo requieren.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Sistema de Gestión: Marco de políticas, procedimientos, guías y recursos asociados para lograrlos objetivos de la Institución.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Políticas: Intenciones globales y orientación tal como se expresan formalmente por la Dirección.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Acción Preventiva: Acción tomada para eliminar la causa de una no conformidad potencial u otra situación potencial no deseable.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Procedimiento: Forma especificada para llevar a cabo una actividad o un proceso.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Registro: Documento que presenta resultados obtenidos o proporciona evidencias de actividades desempeñadas.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Nivel de Riesgo: Combinación de probabilidad de un evento y sus consecuencias.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Aceptación del Riesgo: Decisión de aceptar un riesgo.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Análisis del Riesgo: Uso sistemático de la información para identificar fuentes y estimar el riesgo.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Gestión del Riesgo: Actividades coordinadas para dirigir y controlar una organización en relación con el riesgo.',
                  bullet: { level: 0 },
                },
              ],
              jsonData.nombreEmpresa
            ),

            ...this.createSection(
                '6. Requisitos del SGSI',
               [
      'Para NOMBRE_EMPRESA, como organización que provee servicios de seguridad física a sus clientes, es crucial proteger tanto la información propia como la de sus clientes, reflejando la necesidad de asegurar la confidencialidad, integridad y disponibilidad de la información.',
      'En este apartado se van a tratar todos los requisitos obligatorios que debe de cumplir el SGSI de la compañía.',
    ],
    jsonData.nombreEmpresa,
  )
            
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
              children: [new Paragraph('Política del SGSI' || '')],
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
          size: '16pt',
          color: '808080',  
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
          size: 6,  
        },
      },
    });

    const sectionContent = content.map((item) => {
      if (typeof item === 'string') {
        return new Paragraph({
          text: item.replace(/NOMBRE_EMPRESA/g, nombreEmpresa), 
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
    const spacingParagraph = new Paragraph({
      text: '',
      spacing: {
        after: 400
      },
    });

    return [sectionTitle, ...sectionContent,spacingParagraph];
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




  createClassificationLevelsTable(): Table {
    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Nivel", bold: true })],
              alignment: AlignmentType.CENTER
            })],
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: {
                fill: "D9E2F3", 
              },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Detalle", bold: true })],
              alignment: AlignmentType.CENTER
            })],
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: {
                fill: "D9E2F3", 
              },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Ejemplos", bold: true })],
              alignment: AlignmentType.CENTER
            })],
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: {
                fill: "D9E2F3", 
              },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("Uso público")],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  "Se trata de la información que puede ser conocida por cualquier tipo de persona y su utilización fraudulenta no supone un riesgo para los intereses de la empresa."
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  "Son ejemplos de este tipo de información los catálogos de productos y la información disponible en la página Web."
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("Uso interno")],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  "Es la información utilizada por las áreas de NOMBRE_EMPRESA y cuya utilización fraudulenta supone un riesgo poco significativo."
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  "Son ejemplo de este tipo de información los correos electrónicos y los documentos de trabajo de las áreas de la empresa."
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("Información Confidencial")],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  "Es aquella información que solo puede ser conocida por un número reducido de personas y para la que un uso fraudulento puede suponer un impacto significativo para los intereses de la empresa."
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  "Son ejemplos de este tipo de información los informes de auditoría y de estrategia de la empresa."
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("Información Reservada")],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  "Es la información que únicamente debe conocer el propietario de la misma y cuya divulgación puede suponer graves perjuicios para los intereses de la empresa."
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  "Son ejemplos comunicaciones entre los altos directivos o accionistas con decisiones relevantes para la operativa de negocio."
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph("Información Secreta")],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  "Es aquella cuya revelación no autorizada puede causar un perjuicio excepcionalmente grave a los intereses esenciales de la empresa."
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  "Son ejemplos las claves criptográficas, información sobre fusiones o adquisiciones o cualquier otra información que pueda poner en riesgo el valor de la acción."
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
    });
  }
  

createAcronymsGuideTable(): Table {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Acrónimo", bold: true })],
            alignment: AlignmentType.CENTER
          }), ],
          
            width: { size: 20, type: WidthType.PERCENTAGE 
            },
            
            shading: {
              fill: "D9E2F3", 
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Descripción", bold: true })],
            alignment: AlignmentType.CENTER
          })],
            width: { size: 80, type: WidthType.PERCENTAGE },
            shading: {
              fill: "D9E2F3", 
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("AC")],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph("Active Directory")],
            width: { size: 80, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("ERP")],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph("Software de planificación de recursos empresariales")],
            width: { size: 80, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("HW")],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph("Hardware")],
            width: { size: 80, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("KPI")],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph("Key performance indicator. En español: indicador clave de rendimiento")],
            width: { size: 80, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("ODOO")],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph("ERP")],
            width: { size: 80, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("RRHH")],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph("Recursos Humanos")],
            width: { size: 80, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("SGSI")],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph("Sistema de gestión de la seguridad de la información")],
            width: { size: 80, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("SW")],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph("Software")],
            width: { size: 80, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
    ],
  });
}

}
