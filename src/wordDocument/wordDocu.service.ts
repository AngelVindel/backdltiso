/* eslint-disable prettier/prettier */
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
import { WordDoc } from './wordDocu.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegularUser } from 'src/user/regularU.entity';

@Injectable()
export class WordService {

  constructor(
    @InjectRepository(WordDoc)
    private wordRepository: Repository<WordDoc>,
    @InjectRepository(RegularUser)
    private userRepository: Repository<RegularUser>,
  ) { }



  async generateWordDocumentPSI(
    jsonData: DocuDto):Promise<WordDoc> {
    if (!jsonData) {
      throw new Error(
        'The provided JSON does not have the expected structure.',
      );
    }

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'Heading4',
            name: 'Heading 4',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: '9pt',
              italics: true,
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
            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),
            ...this.createSection('5. Términos y definiciones', [
              `En este documento se utilizan los siguientes términos y/o definiciones:`,
              {
                text: 'Activo de Información: Conocimientos o datos que tienen valor para la empresa.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Seguridad de la Información: Preservación de la confidencialidad, integridad y disponibilidad de la información.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Parte interesada: Persona o grupo que tiene un interés en el desempeño o éxito de la organización.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Sistema de Gestión de la Seguridad de la Información (SGSI): Parte del sistema de gestión global, basada en un enfoque hacia los riesgos del negocio, cuyo fin es establecer, implementar, operar, hacer seguimiento, revisar, mantener y mejorar la seguridad de la información.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Riesgo de Seguridad de la Información: Posibilidad de que una amenaza explote vulnerabilidades de un activo o de un grupo de activos y por lo tanto cause daño a la Institución.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Autenticidad: Propiedad o característica consistente en que una entidad es quien dice ser o bien que garantiza la fuente de la que proceden los datos.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Confidencialidad: Propiedad o característica consistente en que la información ni se pone a disposición, ni se revela a individuos, entidades o procesos no autorizados.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Integridad: Propiedad o característica consistente en que el activo de información no ha sido alterado de manera no autorizada.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Trazabilidad: Cualidad que permite que todas las acciones realizadas sobre la información o un sistema de tratamiento de la información sean asociadas de modo inequívoco a una persona o entidad.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Disponibilidad: Propiedad o característica de que las entidades o procesos autorizados tienen acceso a los mismos cuando lo requieren.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Sistema de Gestión: Marco de políticas, procedimientos, guías y recursos asociados para lograrlos objetivos de la Institución.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Políticas: Intenciones globales y orientación tal como se expresan formalmente por la Dirección.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Acción Preventiva: Acción tomada para eliminar la causa de una no conformidad potencial u otra situación potencial no deseable.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Procedimiento: Forma especificada para llevar a cabo una actividad o un proceso.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Registro: Documento que presenta resultados obtenidos o proporciona evidencias de actividades desempeñadas.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Nivel de Riesgo: Combinación de probabilidad de un evento y sus consecuencias.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Aceptación del Riesgo: Decisión de aceptar un riesgo.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Análisis del Riesgo: Uso sistemático de la información para identificar fuentes y estimar el riesgo.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Gestión del Riesgo: Actividades coordinadas para dirigir y controlar una organización en relación con el riesgo.',
                bullet: {
                  level: 0,
                },
              },
            ], jsonData.nombreEmpresa),


            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),
            ...this.createSection('6. Principios de la Política de Seguridad de la Información', [
              'La presente Política responde a las recomendaciones de las mejores prácticas de Seguridad de la Información recogidas en el Estándar Internacional ISO/IEC 27001, así como al cumplimiento de la legislación vigente en materia de protección de datos personales y de las normativas que, en el ámbito de la Seguridad de la Información, puedan afectar a NOMBRE_EMPRESA.',
              `Además, NOMBRE_EMPRESA establece los siguientes principios básicos como directrices fundamentales de seguridad de la información que han de tenerse siempre presentes en cualquier actividad relacionada con el tratamiento de información:`,
              {
                text: 'Alcance estratégico: La seguridad de la información deberá contar con el compromiso y apoyo de todos los niveles directivos de las sociedades de NOMBRE_EMPRESA de forma que pueda estar coordinada e integrada con el resto de las iniciativas estratégicas para conformar un marco de trabajo completamente coherente y eficaz.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Seguridad integral: La seguridad de la información se entenderá como un proceso integral constituido por elementos técnicos, humanos, materiales y organizativos, evitando, salvo casos de urgencia o necesidad, cualquier actuación puntual o tratamiento coyuntural. La seguridad de la información deberá considerarse como parte de la operativa habitual, estando presente y aplicándose durante todo el proceso de diseño, desarrollo y mantenimiento de los sistemas de información.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Gestión de riesgos: El análisis y gestión de riesgos será parte esencial del proceso de seguridad de la información. La gestión de riesgos permitirá el mantenimiento de un entorno controlado, minimizando los riesgos hasta niveles aceptables. La reducción de estos niveles se realizará mediante el despliegue de medidas de seguridad, que establecerá un equilibrio entre la naturaleza de los datos y los tratamientos, el impacto y la probabilidad de los riesgos a los que están expuestos y la eficacia y el coste de las medidas de seguridad.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Proporcionalidad: El establecimiento de medidas de protección, detección y recuperación deberá ser proporcional a los potenciales riesgos y a la criticidad y valor de la información y de los servicios afectados.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Mejora continua: Las medidas de seguridad se reevaluarán y actualizarán periódicamente para adecuar su eficacia a la constante evolución de los riesgos y sistemas de protección. La seguridad de la información será atendida, revisada y auditada por personal cualificado.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Seguridad por defecto: Los sistemas deberán diseñarse y configurarse de forma que garanticen un grado suficiente de seguridad por defecto.',
                bullet: {
                  level: 0,
                },
              },
              `NOMBRE_EMPRESA considera que las funciones de Seguridad de la Información deberán quedar integradas en todos los niveles jerárquicos de su personal.`,
              `Puesto que la Seguridad de la Información incumbe a todo el personal de NOMBRE_EMPRESA, esta Política deberá ser conocida, comprendida y asumida por todos sus empleados.`,
              `Para la consecución de los objetivos de esta Política, NOMBRE_EMPRESA deberá establecer una estrategia preventiva de análisis sobre los riesgos que pudieran afectarle, identificándolos, implantando controles para su mitigación y estableciendo procedimientos regulares para su reevaluación. En el transcurso de este ciclo de mejora continua, NOMBRE_EMPRESA mantendrá la definición tanto del nivel de riesgo residual aceptado (apetito al riesgo) como de sus umbrales de tolerancia.`,
            ], jsonData.nombreEmpresa),

            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),

            ...this.createSection('7. Gestión de la Seguridad de los Recursos Humanos', [
              'El departamento de Recursos Humanos deberá realizar su gestión teniendo en cuenta los criterios de seguridad establecidos en la Política de Seguridad de la Información, siendo este un punto clave para asegurar su cumplimiento.',
              'Se deberán salvaguardar los requisitos establecidos en la presente Política en todo momento, incluyendo en la fase previa a la contratación, fase de contratación, y fase de desistimiento de contratos de los empleados.',
            ], jsonData.nombreEmpresa),

            ...this.createSection('7.1. Formación y concientización', [
              `NOMBRE_EMPRESA deberá asegurar que todo el personal recibe un nivel de formación y concientización adecuado en materia de Seguridad de la Información en los plazos que exija la normativa interna vigente, especialmente en materia de confidencialidad y prevención de fugas de información.`,
              `Asimismo, los empleados deberán ser informados de las actualizaciones de las políticas y procedimientos de seguridad en los que se vean afectados y de las amenazas existentes, de manera que pueda garantizarse el cumplimiento de esta Política.`,
              `Por otro lado, los empleados tienen la obligación de obrar con diligencia con respecto a la información, debiéndose asegurar que dicha información no caiga en poder de empleados o terceros no autorizados.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('7.2. Política de mesas limpias', [
              'Se establecen los siguientes requisitos con el objetivo de mantener la seguridad en los puestos de trabajo:',
              {
                text: 'Se deberá bloquear la sesión de los equipos cuando el empleado deje el puesto, tanto por medios manuales (bloqueo por parte del usuario), como de forma automatizada (configuración del bloqueo de pantalla).',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Se deberá cerrar completamente la sesión al finalizar la jornada. Esto incluye apagar el equipo y asegurarse de que no queda información de ningún efecto fuera de la vista, salvo que bajo llave los datos o su clasificación sean confidenciales o secretos (véase ANEXO: Niveles de Clasificación).',
                bullet: {
                  level: 0,
                },
              },
              'Se deberá mantener ordenado el puesto de trabajo y despejado de documentos o soportes de información cuando este puesto vaya a ser accesible por otras personas.',
            ], jsonData.nombreEmpresa),


            ...this.createSection('8. Gestión de activos', [
              'Se deberán tener identificados e inventariados los activos de información necesarios para la prestación de los procesos de negocio de NOMBRE_EMPRESA. Adicionalmente, se deberá mantener actualizado el inventario de activos.',
              'Se deberá realizar la clasificación de los activos en función del tipo de información que se vaya a tratar, de acuerdo con lo dispuesto en el apartado 9. Clasificación de la información.',
              'Se deberá asignar un responsable encargado de realizar la gestión propia de los activos de información durante todo el ciclo de vida. El responsable deberá mantener un registro formal de los usuarios con acceso autorizado a dicho activo.',
              'Además, para cada activo o elemento de información deberá existir un responsable o propietario, el cual tendrá la responsabilidad de asegurar que el activo esté inventariado, correctamente clasificado y adecuadamente protegido.',
              'Se deberán actualizar de manera periódica las configuraciones de los activos para permitir el seguimiento de estos y facilitar una correcta actualización de la información.',
            ], jsonData.nombreEmpresa),

            ...this.createSection('8.1. Gestión de dispositivos BYOD o dispositivos personales', [
              `NOMBRE_EMPRESA permitirá la política conocida como BYOD (Bring Your Own Device), que permite a los empleados utilizar sus recursos o dispositivos móviles personales para acceder a recursos o información de NOMBRE_EMPRESA.`,
              `Adicionalmente, los usuarios deberán tener en cuenta una serie de requisitos establecidos en esta Política:`,
              {
                text: 'Se deberán aplicar las mismas medidas y configuraciones de seguridad a los dispositivos BYOD que tratan información igual que al resto de dispositivos de la empresa.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'El usuario será responsable de los equipos BYOD.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: `Los usuarios deberán mantener actualizado el dispositivo BYOD personal donde traten información de cualquier tipo de NOMBRE_EMPRESA. Asimismo, deberán tener instaladas aplicaciones de seguridad mediante software MDM (Mobile Device Management) proporcionadas por el departamento de IT para evitar brechas de seguridad en esos dispositivos.`,
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Los empleados deberán recibir autorización de su responsable de área para utilizar dispositivos BYOD.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Cualquier incidencia que pueda afectar a la confidencialidad, integridad o disponibilidad de estos dispositivos debe ser reportada al responsable de seguridad.',
                bullet: {
                  level: 0,
                },
              },
            ], jsonData.nombreEmpresa),

            ...this.createSection('8.2. Gestión del ciclo de vida de la información', [
              `NOMBRE_EMPRESA deberá gestionar adecuadamente el ciclo de vida de la información, de manera que se puedan evitar usos incorrectos durante cualquiera de las fases.`,
              `El ciclo de vida de un activo de información consta de las siguientes fases:`,
              {
                text: '   1. Creación o recolección: esta fase se ocupa de los registros en su punto de origen. Esto podría incluir su creación por un miembro de NOMBRE_EMPRESA o la recepción de información desde una fuente externa. Incluye correspondencia, formularios, informes, dibujos, entrada/salida del ordenador u otras fuentes.',
                alignment: AlignmentType.JUSTIFIED,
              },
              {
                text: '   2. Distribución: es el proceso de gestión de la información una vez que se ha creado o recibido. Esto incluye tanto la distribución interna como externa, ya que la información que sale de NOMBRE_EMPRESA se convierte en un registro de una transacción con terceros.',
                alignment: AlignmentType.JUSTIFIED,
              },
              {
                text: '   3. Uso o acceso: se lleva a cabo después de que la información se distribuya internamente, y puede generar decisiones de negocio, generar nueva información, o servir para otros fines. Detalla el conjunto de usuarios autorizados por NOMBRE_EMPRESA a acceder a la información.',
                alignment: AlignmentType.JUSTIFIED,
              },
              {
                text: '   4. Almacenamiento: es el proceso de organizar la información en una secuencia predeterminada y la creación de un sistema de gestión para garantizar su utilidad dentro de NOMBRE_EMPRESA. Si no se establece un método de almacenamiento para la presentación de información, su recuperación y uso resultará casi imposible.',
                alignment: AlignmentType.JUSTIFIED,
              },
              {
                text: '   5. Destrucción: establece las prácticas para la eliminación de la información que ha cumplido los períodos de retención definidos y la información que ha dejado de ser útil para NOMBRE_EMPRESA. Los períodos de conservación de la información deberán estar basados en los requisitos normativos, legales y jurídicos que afectan a NOMBRE_EMPRESA. También deberán tenerse en cuenta las necesidades de negocio. Si ninguno de estos requisitos exige que la información sea conservada, deberá ser desechada mediante medios que garanticen su confidencialidad durante el proceso de destrucción.',
                alignment: AlignmentType.JUSTIFIED,
              },
              `NOMBRE_EMPRESA deberá identificar medidas de seguridad de acuerdo con la presente Política para asegurar la correcta gestión del ciclo de vida de los activos.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('8.3. Gestión de copias de seguridad', [
              `Se deberán realizar copias de seguridad de la información, del software y del sistema y se deberán verificar periódicamente. Para ello, se deberán realizar copias de seguridad de aplicaciones, ficheros y bases de datos con una periodicidad, al menos, semanal, salvo que en dicho periodo no se hubiese producido ninguna actualización. En su caso, se podrá establecer una frecuencia más alta de realización de copias de seguridad, si la información a salvaguardar es de impacto alto para NOMBRE_EMPRESA y/o de elevado nivel de transaccionalidad.`,
              `Como norma general, la frecuencia con la que se realizarán las copias de seguridad se determinará en función de la sensibilidad de las aplicaciones o datos, de acuerdo con los criterios de clasificación de información declarados en el anexo “Niveles de clasificación”.`,
              `Las copias de seguridad deberán recibir las mismas protecciones de seguridad que los datos originales, asegurándose su correcta conservación, así como los controles de acceso adecuados.`,
              `Como norma general y siempre que sea posible, se deberá requerir que la información en las copias de seguridad esté cifrada. Este requerimiento será obligatorio para determinados tipos de información confidencial.`,
              `Se deberán realizar pruebas de restauración de las copias de seguridad disponibles y de los procesos de restauración definidos, a fin de garantizar el funcionamiento correcto de los procesos. Estas se realizarán de forma periódica y quedarán documentadas.`,
              `Se deberá establecer un período de retención de las copias de seguridad hasta su destrucción una vez terminado el periodo de existencia.`,
              `Las copias de seguridad, tanto de archivos maestros como de aplicaciones y archivos de información se deberán ubicar en lugares seguros con acceso restringido. Asimismo, las copias de respaldo se ubicarán preferentemente en un centro distinto al que las generó.`,
              `Se deberá garantizar que existe una copia de seguridad adicional de la información sensible protegida ante escritura, de forma que se garantice su integridad ante la necesidad de recuperación frente a posibles incidencias de seguridad asociadas, por ejemplo, un ransomware.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('9. Clasificación de la información', [
              `Se deberá definir un modelo de clasificación de la información que permita conocer e implantar las medidas técnicas y organizativas necesarias para mantener su disponibilidad, confidencialidad e integridad. El modelo de clasificación deberá integrar los requisitos y condiciones establecidos en el presente apartado de la Política.`,
              `El modelo de clasificación deberá tener un responsable encargado de su actualización cuando se crea conveniente, así como de dar a conocer el modelo de clasificación a todos los empleados de NOMBRE_EMPRESA.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('9.1. Tipos de información', [
              `NOMBRE_EMPRESA deberá clasificar la información en función del soporte en el que está siendo utilizado:`,
              {
                text: '   a)  Soportes lógicos: información que esté siendo utilizada mediante medios ofimáticos, correo electrónico o sistemas de información desarrollados a medida o adquiridos a un tercero.',
                alignment: AlignmentType.JUSTIFIED,
              },
              {
                text: '   b)  Soportes físicos: información que esté en papel, soportes magnéticos como USBs, DVDs, etcétera.',
                alignment: AlignmentType.JUSTIFIED,
              },
            ], jsonData.nombreEmpresa),

            ...this.createSection('9.2. Niveles de clasificación', [
              `En función de la sensibilidad de la información, NOMBRE_EMPRESA deberá catalogar la información en cinco niveles, véase la definición precisa en el Anexo “Niveles de clasificación”:`,
              {
                text: 'Uso público',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Uso interno',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Confidencial',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Reservada',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Secreta',
                bullet: {
                  level: 0,
                },
              },
            ], jsonData.nombreEmpresa),

            ...this.createSection('9.3. Gestión de información privilegiada', [
              `La información que se considere confidencial, reservada o secreta se deberá tratar con especial cuidado. Se deberán definir medidas de seguridad extraordinarias o adicionales para el adecuado tratado de la información privilegiada. Este tipo de información se deberá enviar cifrada y mediante protocolos seguros.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('9.4. Etiquetado de la información', [
              `NOMBRE_EMPRESA deberá etiquetar mediante métodos manuales o, en la medida de lo posible, automatizados para facilitar el procesamiento adecuado de las medidas de seguridad que apliquen en cada caso.`,
              `Se deberán etiquetar los documentos o materiales, así como los anexos, copias, traducciones o extractos de estos, según los niveles de clasificación de la información definidos en el subapartado anterior, exceptuando la información considerada de “Uso público”.`,
              `Se deberá definir un proceso o procedimiento para el etiquetado de la información de acuerdo con los siguientes requisitos:`,
              {
                text: 'Asegurar que el etiquetado de la información refleje el esquema de clasificación de la información adoptado.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Asegurar que las etiquetas sean fácilmente reconocibles entre todos los empleados.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Orientar a los empleados sobre dónde y cómo se colocarán o utilizarán las etiquetas, en función del proceso de acceso a la información o a los activos que la soportan.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Indicar las excepciones en los que se permite omitir el etiquetado, sin que ello suponga una omisión del deber de clasificar la información.',
                bullet: {
                  level: 0,
                },
              },
              `Se deberá prestar especial atención y tratar con cuidado máximo el etiquetado de activos físicos que contengan información reservada o secreta, para evitar su sustracción por ser fácilmente identificable.`,
              `Se deberán establecer las medidas técnicas, si fueran necesarias, y viables de etiquetado automático de la información soportada en medios digitales.`,
              `NOMBRE_EMPRESA deberá asegurar la formación y capacitación de todos sus empleados en el etiquetado de la información, así como formar y capacitar específicamente a los empleados que traten información de nivel reservado o secreta.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('9.5. Manipulación de la información', [
              `NOMBRE_EMPRESA se encargará de desarrollar e implementar un conjunto adecuado de procedimientos para la correcta manipulación de la información. Se deberán adoptar las medidas necesarias para proteger la información de acuerdo a su clasificación.`,
              `La información privilegiada estará en todo momento custodiada durante todo el ciclo de vida de la misma.`,
            ], jsonData.nombreEmpresa),
            ...this.createSection('9.6. Privacidad de la información', [
              `NOMBRE_EMPRESA deberá asegurar la privacidad de los datos de carácter personal con el objetivo de proteger los derechos fundamentales de las personas físicas, especialmente su derecho al honor, intimidad personal y familiar y a la propia imagen, mediante el establecimiento de medidas para regular el tratamiento de los datos.`,
              `NOMBRE_EMPRESA deberá cumplir con la legislación vigente en materia de protección de datos personales en función de la jurisdicción en la que esté establecida y opere (a modo ilustrativo, la Ley N° 29733, Ley de Protección de Datos Personales, de julio de 2011, y el Decreto Supremo N° 003-2013-JUS, que aprobó el Reglamento de la Ley de Protección de Datos Personales de marzo de 2013, en Perú) y deberá incluir las medidas necesarias para cumplir con la normativa.`,
              `Se deberán implementar medidas adecuadas para asegurar la privacidad de la información en todas las fases de su ciclo de vida (de acuerdo con el apartado 8.2. Gestión del ciclo de vida de la información).`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('10. Prevención de fugas de información', [
              `La fuga de información es una salida no controlada de información (intencionada o no intencionada) que provoca que la misma llegue a personas no autorizadas o que su propietario pierda el control sobre el acceso a la misma por parte de terceros.`,
              `Se deberán analizar los vectores de fuga de información, en función de las condiciones y operativa de trabajo de NOMBRE_EMPRESA. Para ello, se deberán identificar los activos cuya fuga supone mayor riesgo para cada sociedad, basándose en la criticidad del activo y el nivel de clasificación que la información tenga. Además, se deberán identificar las posibles vías de robo, pérdida o fuga de cada uno de los activos en sus diferentes estados del ciclo de vida.`,
              `NOMBRE_EMPRESA deberá definir procedimientos para evitar la ocurrencia de las situaciones que puedan provocar la pérdida de información, así como procedimientos de actuación en caso de que se notifique una fuga de información.`,
              `Se deberá asegurar la formación y capacitación de todos los empleados en torno a buenas prácticas para la prevención de fugas de información. Especialmente se deberán tener en cuenta, al menos, los siguientes aspectos:`,
              {
                text: 'Proceso para el manejo de dispositivos de alta criticidad conocidos',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Uso adecuado de dispositivos extraíbles como USBs, CD/DVDs o similares',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Uso del correo electrónico',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Transmisión de información de forma oral',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Impresión de documentación',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Salida de documentación',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Uso de dispositivos móviles',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Uso de Internet',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Escritorios limpios y ordenados (véase el apartado 5.2. Política de mesas limpias)',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Equipos desatendidos',
                bullet: {
                  level: 0,
                },
              },
            ], jsonData.nombreEmpresa),

            ...this.createSection('11. Control de acceso', [
              `Todos los sistemas de información de NOMBRE_EMPRESA deberán contar con un sistema de control de acceso a los mismos. Asimismo, el control de acceso se enfoca en asegurar el acceso de los usuarios y prevenir el acceso no autorizado a los sistemas de información, incluyendo medidas como la protección mediante contraseñas.`,
              `El control de acceso se entenderá desde la perspectiva tanto lógica (enfocado a sistemas de la información) como física (véase el apartado 14. Seguridad Física y del Entorno).`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('11.1. Requisitos de negocio para el control de acceso', [
              `NOMBRE_EMPRESA deberá asumir una serie de requisitos de negocio para el control de acceso, que serán, al menos, los siguientes:`,
              {
                text: 'Los usuarios deberán ser únicos y no podrán ser compartidos. Asimismo, los privilegios de los usuarios serán inicialmente asignados mediante el principio de mínimo privilegio.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Se prohibirá el uso de usuarios genéricos. En su defecto, se utilizarán cuentas de usuario asociadas a la identidad nominal de la persona asociada.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Siempre que sea posible, se deberá de disponer de un doble factor de autenticación (MFA) para el acceso a los sistemas de información, siendo obligatorio para aquellos que puedan ser accesibles desde redes públicas.',
                bullet: {
                  level: 0,
                },
              },
            ], jsonData.nombreEmpresa),

            ...this.createSection('11.2. Derechos de acceso', [
              `NOMBRE_EMPRESA deberá implementar controles de acceso que garanticen que a los usuarios sólo se les otorguen privilegios y derechos necesarios para desempeñar su función. Los derechos de acceso deberán ser establecidos en función de:`,
              {
                text: 'Control de acceso basado en roles: deberán establecerse perfiles o roles de acceso por aplicación y/o sistemas para poder asignar los mismos a los diferentes usuarios.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Necesidad de saber: Solo se permitirá el acceso a un recurso cuando exista una necesidad legítima para el desarrollo de la actividad.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Privilegios mínimos: los permisos otorgados a los usuarios deberán ser los mínimos.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Segregación de funciones: deberá asegurarse una correcta segregación de funciones para desarrollar y asignar derechos de acceso.',
                bullet: {
                  level: 0,
                },
              },
              `Asimismo, ningún usuario deberá poder acceder por sí mismo a un sistema de información controlado sin la aprobación del responsable del propio usuario (o de la persona designada).`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('11.3. Control de acceso lógico', [
              `NOMBRE_EMPRESA deberá establecer una Política de contraseñas adecuada y alineada con las buenas prácticas en seguridad. La política de contraseñas definirá los requisitos de las contraseñas y los plazos de mantenimiento de una misma contraseña.`,
              `La Política de contraseñas deberá ser conocida por todos los empleados de la empresa.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('11.4. Trabajo remoto / Teletrabajo', [
              `Se deberá controlar el acceso remoto a la red de NOMBRE_EMPRESA en la modalidad de trabajo a distancia, esto es, desde fuera de las instalaciones propias.`,
              `Los servicios de conexión al trabajo en remoto estarán destinados exclusivamente a personal de NOMBRE_EMPRESA. Su uso por parte de cualquier otro tipo de colaborador requerirá autorización del responsable de seguridad.`,
              `El equipo utilizado para la conexión en la modalidad de trabajo en remoto podrá ser propiedad del empleado o proporcionado por la empresa. En cualquier caso, es obligatorio que el equipo cumpla con los siguientes requerimientos de seguridad:`,
              {
                text: '   a)  Capacidad de realizar una conexión a través de una VPN.',
                alignment: AlignmentType.JUSTIFIED,
              },
              {
                text: '   b)  Disponer de un sistema operativo actualizado con los últimos parches y actualizaciones de seguridad.',
                alignment: AlignmentType.JUSTIFIED,
              },
              {
                text: '   c)  Software antivirus instalado.',
                alignment: AlignmentType.JUSTIFIED,
              },
              {
                text: '   d)  Software de firewall/cortafuegos personal instalado.',
                alignment: AlignmentType.JUSTIFIED,
              },
              `El trabajo remoto / teletrabajo desde un equipo propio del trabajador requerirá de todas las medidas de seguridad oportunas, con el objetivo de que el trabajo en remoto no suponga una amenaza para la seguridad de la información de NOMBRE_EMPRESA. Además, se podrán establecer medidas de seguridad adicionales a las existentes para asegurar de una manera más fiable la conexión segura en remoto.`,
              `El servicio de teletrabajo se monitorizará y controlará, registrándose tanto la conexión como la actividad de acuerdo con los protocolos de seguridad.`,
            ], jsonData.nombreEmpresa),


            ...this.createSection('12. Gestión del ciclo de vida de la identidad', [
              `NOMBRE_EMPRESA deberá definir e implementar un adecuado sistema de gestión del ciclo de vida de la identidad. La identidad es el conjunto de características que identifican de forma unívoca a toda persona con acceso físico o lógico a los sistemas de información de NOMBRE_EMPRESA. El ciclo de vida de la identidad es el proceso que sigue la identidad de un usuario desde su creación hasta su eliminación.`,
              `El ciclo de vida de la identidad se compone de las siguientes actividades:`,
              {
                text: '   a)  Creación y asignación de la identidad',
                alignment: AlignmentType.JUSTIFIED,
              },
              {
                text: '   b)  Revisión periódica',
                alignment: AlignmentType.JUSTIFIED,
              },
              {
                text: '   c)  Modificación o eliminación',
                alignment: AlignmentType.JUSTIFIED,
              },
              `La gestión de este ciclo requiere definir los requisitos de seguridad y responsabilidades de cada una de las etapas, con el objetivo de centralizar y facilitar los procesos de gestión asociados a las mismas.`,
              `La gestión del ciclo de vida de la identidad deberá estar alineado con el Departamento de RRHH con el objetivo de verificar las identidades en función de las altas y las bajas de empleados y su correspondencia en los sistemas de información.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('12.1. Identidades privilegiadas', [
              `La asignación y uso de derechos de acceso privilegiado deberá estar restringida y controlada. El acceso privilegiado es el acceso a sistemas como administrador o con un rol que ofrezca la posibilidad de modificarla configuración del sistema.`,
              `La asignación de derechos de acceso privilegiado deberá ser controlada a través de un proceso formal de autorización de acuerdo con las políticas de control de acceso. Deberán considerarse, al menos, los siguientes requisitos:`,
              {
                text: 'Deberán identificarse los derechos de acceso privilegiados asociados a cada sistema o proceso (por ejemplo, sistema operativo, sistema de gestión de base de datos o aplicación), así como los usuarios a los que estos les deberán ser asignados.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'La asignación de derechos de acceso privilegiados deberá realizarse en base a las necesidades de uso, basándose en el mínimo privilegio y necesidad de saber.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Deberá definirse un proceso de autorización que incluya un registro de los privilegios asignados. No deberán concederse derechos de acceso privilegiado hasta que el proceso de autorización se complete.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Deberán definirse los requisitos para la caducidad de los derechos de acceso privilegiado.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Las competencias de los usuarios con derechos de acceso privilegiado deberán revisarse regularmente con el objetivo de verificar que se encuentran alineadas con sus obligaciones.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Deberán establecerse y mantenerse procedimientos y mecanismos específicos para evitar el uso no autorizado de cuentas de usuario genéricas para la administración, conformes con las capacidades de configuración de los sistemas.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Se deberán establecer procedimientos y mecanismos que aseguren la confidencialidad de la información secreta de autenticación para los usuarios genéricos de administración (por ejemplo, modificación frecuente de contraseña, mecanismos de compartición de la contraseña seguros, etc.).',
                bullet: {
                  level: 0,
                },
              },
            ], jsonData.nombreEmpresa),

            ...this.createSection('13. Seguridad física y del entorno', [
              `Los espacios físicos donde se ubiquen los sistemas de información de NOMBRE_EMPRESA deberán estar protegidos adecuadamente mediante controles de acceso perimetrales, sistemas de vigilancia y medidas preventivas de manera que puedan evitarse o mitigar el impacto de incidentes de Seguridad (accesos no autorizados a sistemas de información, robo o sabotaje) y accidentes ambientales (incendios, inundaciones, cortes de suministro eléctrico, etc.).`,
              `Además, deberá haber un control de acceso físico a la información que se encuentre en formato físico mediante un registro en papel sobre quién accede a la información. Por otra parte, la información confidencial se deberá almacenar con medidas específicas como armarios ignífugos.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('14. Seguridad en la nube o cloud', [
              `NOMBRE_EMPRESA deberá mantener una política de trabajo en la nube o cloud computing que establezca las medidas de seguridad adecuadas para la confidencialidad, integridad y disponibilidad de la información. Dependiendo del tipo de modelo de servicio en la nube, se deberán aplicar diferentes medidas de seguridad:`,
              {
                text: 'Infraestructura: en primer lugar, se deberá asegurar que el Proveedor monitoriza el entorno para detectar cambios no autorizados. Además, se deberán establecer fuertes niveles de autenticación y control de acceso para los administradores y las operaciones que estos realicen. Por último, las instalaciones y/o configuraciones de los elementos comunes deberán estar registrados y conectados con el objetivo de obtener la trazabilidad adecuada.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Plataforma: de forma adicional a las medidas indicadas en el modelo de servicio de Infraestructura, el Proveedor del servicio deberá proporcionar mecanismos de seguridad correspondientes al ciclo de vida del software seguro, de acuerdo con el apartado 17. Seguridad en el ciclo de vida del desarrollo de sistemas.',
                bullet: {
                  level: 0,
                },
              },
              {
                text: 'Software: de forma adicional a las medidas indicadas en el modelo de servicio de Plataforma, NOMBRE_EMPRESA y el Proveedor deberán seguir OWASP (Open Web Application Security) como guía para la seguridad de las aplicaciones.',
                bullet: {
                  level: 0,
                },
              },
            ], jsonData.nombreEmpresa),

            ...this.createSection('15. Seguridad operativa', [
              `Todos los sistemas de información de NOMBRE_EMPRESA que procesan o almacenan información de su propiedad deberán contar con las medidas de seguridad oportunas que optimicen su nivel de madurez adecuado (monitorización, control de cambios, revisiones, etc). Asimismo, se deberán gestionar, controlar y monitorizar las redes de manera adecuada, a fin de protegerse de las amenazas y mantener la seguridad de los sistemas y aplicaciones que utilizan la red, incluidos los controles de acceso a la red, protegiendo así toda la información que se transfiera a través de estos elementos y/o entornos.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('16. Seguridad en las telecomunicaciones', [
              `La arquitectura de red de NOMBRE_EMPRESA deberá contar con medidas de prevención, detección y respuesta para evitar brechas en los dominios internos y externos. Se entiende por "dominio interno" la red local compuesta por los elementos tecnológicos de NOMBRE_EMPRESA accesibles exclusivamente desde la red interna. Por otra parte, se entiende por "dominio externo" la red accesible desde el exterior de la red de NOMBRE_EMPRESA.`,
              `Es de suma importancia la administración de seguridad de las redes que atraviesan el perímetro de NOMBRE_EMPRESA, implantando controles adicionales para los datos sensibles que circulen por las redes de comunicación públicas.`,
              `Por ello, NOMBRE_EMPRESA definirá las pautas de seguridad a seguir con relación a la transferencia de información, así como las medidas de seguridad en la utilización de equipos portátiles, servicios de Internet y correo electrónico, y de controles específicos que permitan una conexión segura a los sistemas de información de NOMBRE_EMPRESA desde fuera de sus instalaciones.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('17. Seguridad en el ciclo de vida del desarrollo de sistemas', [
              `Toda la adquisición, desarrollo y mantenimiento de los sistemas deberá contar con unos requisitos mínimos de seguridad necesarios para el desarrollo de software, los sistemas y los datos acorde con las buenas prácticas del sector. Además, deberá realizarse una gestión de las pruebas, el seguimiento de los cambios, y el inventario del software.`,
              `Cada departamento de NOMBRE_EMPRESA deberá tener en cuenta la seguridad de la información en sus procesos de sistemas y datos, procedimientos de selección, desarrollo e implementación de aplicaciones, productos y servicios.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('18. Seguridad en los proveedores', [
              `Se deberá poner especial atención en evaluar la criticidad de todos los servicios susceptibles de ser subcontratados de manera que puedan identificarse aquellos que sean relevantes desde el punto de vista de la seguridad de la información, ya sea por su naturaleza, la sensibilidad de los datos que deban tratarse o la dependencia sobre la continuidad de negocio.`,
              `Sobre los proveedores de estos servicios se deberán cuidar los procesos de selección, requerimientos contractuales como la terminación contractual, la monitorización de los niveles de servicio, la devolución de datos y las medidas de seguridad implantadas por dicho proveedor, que deberán ser, al menos, equivalentes a las que se establecen en la presente Política.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('19. Gestión de incidentes', [
              `Todos los empleados de NOMBRE_EMPRESA tienen la obligación y responsabilidad de la identificación y notificación al responsable de seguridad de la sociedad de cualquier incidente o delito que pudiera comprometer la seguridad de sus activos de información. Asimismo, NOMBRE_EMPRESA deberá implementar procedimientos para la correcta gestión de los incidentes detectados.`,
              `Se deberá definir un procedimiento de gestión de respuesta ante incidentes, en el que se defina un proceso de categorización de incidentes, análisis de impacto de negocio y escalado por parte de la función de seguridad de la información y ciberseguridad ante cualquier incidente relacionado con la seguridad de la información.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('20. Continuidad de negocio', [
              `Respondiendo a requerimientos de calidad y buenas prácticas, NOMBRE_EMPRESA deberá disponer de un Plan de Continuidad de Negocio como parte de su estrategia para garantizar la continuidad de la prestación de sus servicios esenciales o críticos y el adecuado manejo de los impactos sobre el negocio ante posibles escenarios de crisis, proporcionando una marca de referencia para que la sociedad actúe en caso de ser necesario.`,
              `Este Plan de Continuidad deberá ser actualizado y probado periódicamente. Además, se deberá definir y mantener actualizado un Plan de Recuperación ante Desastres alineado con la continuidad de negocio, este plan abarcará la continuidad del funcionamiento de las tecnologías de información y comunicación.`,
              `NOMBRE_EMPRESA deberá encargarse de la formación y capacitación para todos sus empleados en materia de Continuidad del Negocio. La formación en materia de Continuidad del Negocio deberá ser revisada periódicamente con el objetivo de estar totalmente alineada con el Plan existente.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('21. Cumplimiento regulatorio de sistemas', [
              `NOMBRE_EMPRESA deberá comprometerse a adoptar las acciones necesarias para dar cumplimiento a toda la legislación y regulación aplicable a su actividad en materia de seguridad de la información, sistemas de información y protección de datos. Esto incluye establecer procedimientos adecuados para asegurar el cumplimiento de toda legislación, normativa y estándares aplicables.`,
            ], jsonData.nombreEmpresa),
            ...this.createSection('22. Auditorías de seguridad y gestión de vulnerabilidades', [
              `Se deberá realizar una identificación periódica de vulnerabilidades técnicas de los sistemas de información y aplicaciones empleadas en la organización, de acuerdo a su exposición a dichas vulnerabilidades y adoptando las medidas adecuadas para mitigar el riesgo asociado.`,
              `Una vez identificadas las vulnerabilidades, la organización deberá aplicar las medidas correctoras necesarias tan pronto como sea posible. La identificación, gestión y corrección de las vulnerabilidades debe hacerse conforme a un enfoque basado en riesgos, teniendo en cuenta la criticidad y la exposición de los activos.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('23. Gestión de excepciones', [
              `Cualquier excepción a la presente Política de Seguridad de la Información deberá ser registrada e informada al responsable de la Seguridad de la Información de NOMBRE_EMPRESA. Las excepciones serán analizadas para evaluar el riesgo que podrían introducir a la sociedad y, en base a la categorización de estos riesgos, estos deberán ser asumidos por el peticionario de la excepción junto con los responsables del negocio.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('24. Sanciones disciplinarias', [
              `Cualquier violación de la presente Política de Seguridad de la Información puede resultar en la toma de las acciones disciplinarias correspondientes de acuerdo con el proceso interno de NOMBRE_EMPRESA. Es responsabilidad de todos los empleados de NOMBRE_EMPRESA notificar al responsable de Seguridad de la Información cualquier evento que indiquen que pueda suponer el incumplimiento de alguna de las directrices definidas por la presente Política.`,
            ], jsonData.nombreEmpresa),

            ...this.createSection('25. Revisión de la política', [
              `La aprobación de esta Política implica que su implantación contará con el apoyo de la Dirección para lograr todos los objetivos establecidos en la misma, como también para cumplir con todos sus preceptos.`,
              `La presente Política de Seguridad de la Información, será revisada y aprobada por el Comité de Dirección. No obstante, si la situación en la sociedad lo permite, se podrá efectuar una revisión cuando se presenten cambios relevantes en la sociedad o se identifiquen nuevas amenazas en el entorno de manera imprevista y que justifiquen la necesidad de ser revisada, corregida o actualizada, para garantizar que la Política permanezca adaptada en todo momento a la realidad de NOMBRE_EMPRESA.`,
            ], jsonData.nombreEmpresa),

            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),


            new Paragraph({
              children: [
                new TextRun({
                  text: 'ANEXO I. Niveles de clasificación',
                  size: 28,
                  color: '808080',
                }),
              ],
              border: {
                bottom: {
                  color: '808080',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                },
              },
              spacing: {
                after: 200,
              },
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              text: 'Se adjunto los requisitos obligatorios que tienen que cumplir un Sistema de Gestión de la Seguridad de la Información según la ISO/IEC 27001:',
              spacing: {
                after: 200,
              },
            }),
            this.createClassificationLevelsTable(),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Tabla 1. Niveles de clasificación',
                  size: '9pt',
                }),
              ],
              spacing: { before: 200 },
              alignment: AlignmentType.CENTER,
              heading: HeadingLevel.HEADING_4,
              style: 'Heading4',
            }),


            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),


            new Paragraph({
              children: [
                new TextRun({
                  text: 'Guía de acrónimos',
                  size: 28,
                  color: '808080',
                }),
              ],
              border: {
                bottom: {
                  color: '808080',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                },
              },
              spacing: {
                after: 200,
              },
              heading: HeadingLevel.HEADING_1
            }),
            this.createAcronymsGuideTable(),


            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Respuesta del Wizard',
                  size: 28,
                  color: '808080',
                }),
              ],
              border: {
                bottom: {
                  color: '808080',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                },
              },
              spacing: {
                after: 200,
              },
              heading: HeadingLevel.HEADING_1
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: jsonData.textIA,
                })
              ]

            })

          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    const fileName = jsonData.nombreEmpresa.replace(/[^a-zA-Z0-9]/g, '_');

    if(!jsonData.userId){
      throw new Error('Cannot create a document without an assigned user')
    }

    const word = this.wordRepository.create({
      userId: jsonData.userId,
      content: buffer,
      fileName:fileName,
      creationDate: new Date(),
      modifyDate: new Date(),
      type: 1
    })
    try {
     const wordC= await this.wordRepository.save(word);
      return wordC
    } catch (error) {

      throw new Error(`Failed to save the word document: ${error.message}`);

    }
  }


  async downloadWord(documentID: number): Promise<{ wordBuffer: Buffer; fileName: string }>{
    const document = await this.wordRepository.findOne({
      where: {
        id: documentID
      },
    });

    if (!document) {
      throw new Error('Document not found or does not belong to the user.');
    }
  
    return {
      wordBuffer: document.content,
      fileName: document.fileName, 
    };


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
              text: '\t\t\t\t\t\t\t\t\t           NOMBRE-POLITICA',
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

    return [sectionTitle, ...sectionContent, spacingParagraph];
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
              children: [new Paragraph({
                children: [new TextRun({ text: "Nivel", bold: true })],
                alignment: AlignmentType.CENTER
              })],
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: {
                fill: "D9E2F3",
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: "Detalle", bold: true })],
                alignment: AlignmentType.CENTER
              })],
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: {
                fill: "D9E2F3",
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: "Ejemplos", bold: true })],
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
              children: [new Paragraph('Información Secreta')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  'Es aquella cuya revelación no autorizada puede causar un perjuicio excepcionalmente grave a los intereses esenciales de la empresa.',
                ),
              ],
              width: { size: 40, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph(
                  'Son ejemplos las claves criptográficas, información sobre fusiones o adquisiciones o cualquier otra información que pueda poner en riesgo el valor de la acción.',
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
              children: [new Paragraph({
                children: [new TextRun({ text: "Acrónimo", bold: true })],
                alignment: AlignmentType.CENTER
              }),],

              width: {
                size: 20, type: WidthType.PERCENTAGE
              },

              shading: {
                fill: 'D9E2F3',
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: "Descripción", bold: true })],
                alignment: AlignmentType.CENTER
              })],
              width: { size: 80, type: WidthType.PERCENTAGE },
              shading: {
                fill: 'D9E2F3',
              },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('AC')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('Active Directory')],
              width: { size: 80, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('ERP')],
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
              children: [new Paragraph('HW')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('Hardware')],
              width: { size: 80, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('KPI')],
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
              children: [new Paragraph('ODOO')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('ERP')],
              width: { size: 80, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('RRHH')],
              width: { size: 20, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph('Recursos Humanos')],
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

  async deleteWord(id: number): Promise<void> {
    const pdf = await this.wordRepository.findOneBy({ id  });
    if (!pdf) {
      throw new Error('PDF not found');
    }

    await this.wordRepository.delete(id);
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
