import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as libre from 'libreoffice-convert';
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType } from 'docx';
import { promisify } from 'util';

const libreConvert = promisify(libre.convert);

@Injectable()
export class DocGeneratorService {
  async generateDoc(data: any): Promise<Buffer> {
    try {
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'USO INTERNO',
                    bold: true,
                  }),
                  new TextRun({
                    text: '\n\nNOMBRE_EMPRESA\n\nLogo empresa\n\nPolítica de la Seguridad de Información\n\nSistema de Gestión de la Seguridad de Información (SGSI)',
                    break: 1,
                  }),
                  new TextRun({
                    text: '\n\nNombre documento: Política de la Seguridad de la Información\nReferencia: ' + (data.referencia || 'XXXXXXXXX') +
                          '\nVersión: ' + (data.version || '1.0') +
                          '\nRealizado por: ' + (data.realizadoPor || 'RESPONSABLE-SEGURIDAD') +
                          '\nRevisado por: ' + (data.revisadoPor || 'RESPONSABLE-TI') +
                          '\nAprobado por: ' + (data.aprobadoPor || 'COMITE-DIRECCION') +
                          '\nFecha: ' + (data.fecha || '99/99/9999') +
                          '\nEstado: ' + (data.estado || 'Pendiente de aprobación') +
                          '\nClasificación: Uso Interno',
                    break: 1,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'NUM-REFERENCIA\nLogo compañía\nNOMBRE-POLITICA\nUso Interno\n\n2\n\nRegistro de cambios del documento\n\n',
                    break: 1,
                  }),
                ],
              }),
              this.createChangeLogTable(),
              // Continuar con las otras secciones
            ],
          },
        ],
      });

      // Crear el buffer del documento
      const buffer = await Packer.toBuffer(doc);

      // Convertir el documento a PDF directamente desde el buffer
      const pdfBuffer = await this.convertToPdf(buffer);
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating document:', error);
      throw new InternalServerErrorException('Error generating document: ' + error.message);
    }
  }

  async convertToPdf(buffer: Buffer): Promise<Buffer> {
    const extend = '.pdf';
    try {
      return await libreConvert(buffer, extend, undefined);
    } catch (error) {
      console.error('Error converting document to PDF:', error);
      throw new InternalServerErrorException('Error converting document to PDF: ' + error.message);
    }
  }

  createChangeLogTable(): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Versión')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('Fecha')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('Autor')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('Aprobado')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('Descripción')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        // Ejemplo de fila, puedes agregar datos dinámicos aquí
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('1.0')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('99/99/9999')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('NOMBRE_EMPRESA')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('Comité')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('Documento original')],
              width: { size: 20, type: WidthType.PERCENTAGE },
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
}
