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
  ShadingType
} from 'docx';

import * as fs from 'fs';
import * as libre from 'libreoffice-convert';
import * as path from 'path';
import { DocuDto } from './dto/wordDocu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WordDoc } from './wordDocu.entity';
import { RegularUser } from 'src/user/regularU.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WordService2 {

  constructor(
    @InjectRepository(WordDoc)
    private wordRepository: Repository<WordDoc>,
    @InjectRepository(RegularUser)
    private userRepository: Repository<RegularUser>,
  ) { }



  async generateWordDocumentSGSI(
    jsonData: DocuDto,
  ): Promise<WordDoc>{
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

            ...this.createSection('3. Alcance del SGSI', [
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

            ...this.createSection('5. Términos y definiciones',
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
              jsonData.nombreEmpresa),

            ...this.createSection('6.1. Sección 4. Contexto de la organización',
              [
                '-Contexto organizacional.-',
                'Los objetivos del SGSI se establecerán en las funciones y niveles pertinentes, enfocados a la mejora y utilizando como marco de referencia:',
                {
                  text: 'Cambios en las necesidades de las partes interesadas que lleven a una mejora del alcance del sistema.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Requisitos de seguridad de la información aplicables y los resultados de la apreciación y el tratamiento de los riesgos para garantizar la confidencialidad, integridad, disponibilidad, trazabilidad y autenticidad de la información, así como la protección de los datos personales.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Factores internos como la aplicación de técnicas organizativas que mejoren el seguimiento de la tramitación y resolución de incidentes de seguridad.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Factores externos como los avances tecnológicos, cuya aplicación mejore la eficacia del tratamiento de los riesgos.',
                  bullet: { level: 0 },
                },
                {
                  text: 'La mejora y la eficacia de la formación y concienciación del personal que trabajan en el ámbito de la seguridad de la información.',
                  bullet: { level: 0 },
                },
                '',
                '-Partes interesadas.-',
                'Internas: Personal interno, ya sea personal gerencial u operativo de todos los departamentos. Le afectan las leyes relativas a toda la normativa y buenas prácticas de la empresa. Siempre las cumplirán y las harán cumplir.',
                'Proveedores de servicios y suministros: todo servicio, suministro, equipo, además de leyes nacionales. Entidades externas que impongan las normas de la compañía, incluso las relativas a la seguridad.',
                'Otros terceros: Clientes reclamando que los servicios recibidos por la empresa sean de calidad y cumplan con los requisitos de la norma.',
                'Otros terceros: Empresas colaboradoras, propietarios de la empresa, exigirán el cumplimiento legal y normativo de todos los empleados.',
                'Identificar las partes interesadas incluyendo leyes aplicables, regulaciones, contratos, etc. y Determinar sus requisitos relevantes al respecto de la seguridad de la información y sus obligaciones.',
                '',
                '-Alcance del SGSI.-',
                'Se detallarán las áreas y activos de la información que están incluidos dentro del sistema de gestión de seguridad de la información teniendo en cuenta los puntos anteriores, el contexto organizacional y las partes interesadas, así como los proveedores y aquellos terceros que realizan procesos del SGSI. (Pendiente de realizar)',
                '',
                'De forma estructurada el alcance es:',
                {
                  text: 'Procesos de Negocio Involucrados. A detallar',
                  bullet: { level: 0 },
                },
                {
                  text: 'Activos de Información Críticas. A detallar.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Infraestructura Tecnológica: Sistemas de TI, redes y plataformas de comunicación.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Personal interno y externo con acceso a los activos.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Ubicaciones Físicas: Oficinas y entornos remotos de almacenamiento de datos.',
                  bullet: { level: 0 },
                },
                {
                  text: 'Proveedores y Terceros: Servicios de terceros que tienen acceso a los servicios entregados.',
                  bullet: { level: 0 },
                },
                '',
                '-Sistema de Gestión de Seguridad de la Información (SGSI).-',
                'Mediante este documento se establece, implementa, mantiene y se establece un proceso de mejora continua el SGSI implantando en la empresa de conformidad con la norma.'
              ],
              jsonData.nombreEmpresa,
            ),
            ...this.createSection(
              '6.2. Sección 5. Liderazgo',
              [
                '-Liderazgo y compromiso.-',
                'La alta dirección debe demostrar el liderazgo y compromiso en relación con el SGSI, aprobando este documento, aportando los recursos necesarios y difundiendo este documento entre todos los interesados: empleados, proveedores y terceros.',
                'Para ello debe:',
                {
                  text: '   a)  Asegurar que la política de seguridad de la información y los objetivos de seguridad de la información establecidos y sean compatibles con la dirección estratégica de la organización;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   b)  Garantizar la integración de los requisitos del sistema de gestión de la seguridad de la información en los procesos de la organización;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   c)  Garantizar que se disponen de los recursos necesarios para el sistema de gestión de la seguridad de la información;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   d)  Comunicar la importancia de una gestión eficaz de la seguridad de la información y de ajustarse a los requisitos del sistema de gestión de la seguridad de la información;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   e)  Garantizar que el sistema de gestión de la seguridad de la información logre los resultados previstos;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   f)  Dirigir y apoyar a las personas para que contribuyan a la eficacia del sistema de gestión de la seguridad de la información sistema de gestión de la seguridad de la información;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   g)  Promoviendo la mejora continua;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   h)  Apoyar a otras funciones de gestión pertinentes para que demuestren su liderazgo en lo que se refiere a sus áreas de responsabilidad.',
                  alignment: AlignmentType.JUSTIFIED,
                },
                '',
                '-Política.-',
                'Se desarrolla e implanta la “Política de Seguridad de la Información” aprobada, en su primera versión, el 99/99/9999.',
                'Con esta política se proporciona el marco para establecer objetivos de seguridad de la información y su compromiso para satisfacer los requisitos aplicables relacionados con la seguridad de la información y la mejora continua del sistema de gestión de la seguridad de la información.',
                'Dicha política está disponible a todos los empleados y partes interesadas mediante los canales establecidos.',
                '',
                '-Roles, responsabilidades y autoridades en la organización.-',
                'En el apartado 4 de este documento se identifican las áreas y sus responsabilidades para cumplir y mejorar el SGSI según el alcance definido, teniendo todas ellas la autoridad necesaria para llevarlas a cabo.',],
              jsonData.nombreEmpresa),

            ...this.createSection(
              '6.3. Sección 6. Planificación',
              [
                '-Acciones para abordar los riesgos y oportunidades.-',
                'Con este documento se desea que el SGSI para satisfacer los requisitos, tratando con los riesgos y oportunidades identificados en el análisis de riesgos, basado en la “Metodología de Análisis de Riesgos” de la compañía.',
                'El análisis de riesgos garantiza que el sistema de gestión de la seguridad de la información pueda lograr los resultados previstos, prevenir o reducir los efectos no deseados y lograr una mejora continua.',
                'Para ello la organización planifica las acciones en los procesos para abordar estos riesgos y oportunidades y evaluar su eficacia.',
                'La “Metodología de Análisis de Riesgos” de la compañía define un proceso de evaluación de riesgos de seguridad de la información que:',
                {
                  text: '   a)  Establece y mantiene los criterios de riesgo para la seguridad de la información que incluyen los criterios de aceptación del riesgo; y los criterios para realizar evaluaciones de los riesgos de seguridad de la información;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   b)  Garantice que las evaluaciones repetidas de los riesgos para la seguridad de la información producen resultados coherentes, válidos y resultados comparables;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   c)  Identifique los riesgos para la seguridad de la información mediante un proceso de evaluación de riesgos para la seguridad de la información para identificar los riesgos asociados a la pérdida de confidencialidad, integridad y disponibilidad de la información dentro del ámbito del sistema de gestión de seguridad de la información; e identifique a los responsables de los riesgos;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   d)  Analice los riesgos para la seguridad de la información y evalúe las consecuencias potenciales que se derivarán si los riesgos identificados se materializarán; además de evaluar la probabilidad realista de que se produzcan los riesgos identificados y determinar los niveles de riesgo;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   e)  Evalúe los riesgos para la seguridad de la información y priorice los riesgos analizados para su tratamiento según los criterios de riesgo establecidos.',
                  alignment: AlignmentType.JUSTIFIED,
                },
                '',
                '-Objetivos y planes de seguridad de la información.-',
                'Establezca y documenta los objetivos y planes de seguridad de la información.',
                'Los objetivos de seguridad de la información son coherentes con la política de seguridad de la información; medibles si es factible; y es objeto de seguimiento.',
                'Para ello, la organización ha determinado:',
                {
                  text: '   i)  qué se hará;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   j)  qué recursos serán necesarios;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   k)  quién será el responsable;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   l)  cuándo se completará;',
                  alignment: AlignmentType.JUSTIFIED,
                },
                {
                  text: '   m)  cómo se evaluarán los resultados.',
                  alignment: AlignmentType.JUSTIFIED,
                },
                'La organización conserva la información documentada sobre los objetivos de seguridad de la información.',
                '',
                '-Planificación de cambios.-',
                'Los cambios sustanciales al SGSI son llevados a cabo de manera planificada previa autorización y con la participación de la alta Dirección, quedando estos registrados en el propio documento de cambios.',
              ],
              jsonData.nombreEmpresa),

            ...this.createSection(
              '6.4. Sección 7. Soporte',
              [
                '-Recursos-',
                'Por parte de la Dirección se han determinado los recursos necesarios para el SGSI, tanto los recursos humanos (RRHH) como la infraestructura necesaria.',
                '-Competencias-',
                'Se han determinado y documentado todas las competencias necesarias para el funcionamiento del SGSI.',
                '-Concientización-',
                'Hay establecido un programa de concientización en seguridad en la que se da a conocer:',
                {
                  text: 'SGSI',
                  bullet: { level: 0 },
                },
                {
                  text: 'La política de seguridad',
                  bullet: { level: 0 },
                },
                {
                  text: 'Concientización en ciberseguridad, en general',
                  bullet: { level: 0 },
                },
                'Todo ello, para contribuir a la eficacia del SGSI, y las implicaciones de no ajustarse a este sistema.',
                '-Comunicación-',
                'Existencia de un plan de comunicación interna y externa que transmita los temas relevantes del SGSI que recoge el qué, el cuándo, el cómo y a quién.',
                '-Gestión de la documentación-',
                '',
                'Hay establecido un procedimiento de gestión de documentación para esta y otras normas liderada por el área de Calidad que está a disposición de todos los empleados. Además, aquellas normas aplicables a terceros estarán disponibles para ellos. (¿Existe?)',
                'La documentación en la empresa tiene un formato definido, y regularmente es revisada y si hubiese cambios se aprueba por el área responsable y posteriormente se difunde.',
              ],
              jsonData.nombreEmpresa
            ),
            ...this.createSection(
              '6.5. Sección 8. Operación',
              [
                '-Planificación y control operacional-',
                'Existe un documento denominado “Plan de Tratamiento de Riesgos” (Pendiente de realizar) basado en lo recogido en la Sección 6 de Planificación y que es actualizado cuando hay un cambio en la planificación.',
                '-Apreciación del riesgo de seguridad de la información-',
                'La organización realiza, y documenta, evaluaciones de riesgos de seguridad de la información a intervalos planificados (anuales) o cuando se propongan o se produzcan cambios significativos teniendo en cuenta los criterios establecidos en cuanto a la gestión del riesgo.',
                '-Tratamiento del riesgo de seguridad de la información-',
                'El tratamiento del riesgo se recoge en el “Plan de Tratamiento de Riesgos” determinado a partir del análisis de riesgos y son documentados los resultados en dicho documento.',
              ],
              jsonData.nombreEmpresa),
            ...this.createSection(
              '6.6. Sección 9. Evaluación del desempeño',
              [
                '-Seguimiento, medición, análisis y evaluación-',
                'La organización evalúa el rendimiento de la seguridad de la información y la eficacia del sistema de gestión de la seguridad de la información.',
                'Para ello, realiza el seguimiento, análisis y evaluación del SGSI y los controles, para los procesos y controles mediante un método de seguimiento que indica el cómo, cuándo y quién. Posteriormente se realiza un análisis y evaluación de resultados.',
                'Se dispone de información documentada como prueba de los resultados.',
                '-Auditoría interna-',
                'Se planifican y llevan a cabo auditorías internas del SGSI anualmente.',
                'Las auditorías se ajustan al sistema de gestión de la seguridad de la información y a los requisitos de este documento.',
                'El alcance y los criterios de la auditoría son determinados por el área responsable de este trabajo, siendo el trabajo realizado por personal independiente.',
                '-Revisión por la dirección-',
                'Se realizan revisiones por la dirección del SGSI cada 2 meses, estando estas recogidas en las correspondientes actas.',
                'En las revisiones se tratan, entre otros temas:',
                {
                  text: 'Revisión y estado del plan de tratamiento de riesgos',
                  bullet: { level: 0 },
                },
                {
                  text: 'Cambios en el SGSI',
                  bullet: { level: 0 },
                },
                {
                  text: 'Seguimiento del rendimiento del SGSI: No conformidades, KPI, evaluación de riesgos, …',
                  bullet: { level: 0 },
                },
                'Los resultados de la revisión realizada por la dirección incluirán decisiones relacionadas con la mejora continua, oportunidades y cualquier necesidad de cambios en el sistema de gestión de la seguridad de la información.',
              ],
              jsonData.nombreEmpresa
            ),

            ...this.createSection(
              '6.7. Sección 10. Mejora',
              [
                '-Mejora continua-',
                'La organización tiene la obligación de mejorar continuamente la adecuación y eficacia del sistema de gestión de la seguridad de la información mediante las revisiones realizadas por la Dirección, así como las auditorías independientes.',
                '-No conformidad y acciones correctivas-',
                'La organización, ya sea por la gestión de riesgos o las auditorías realizadas, corrige y lleva a cabo acciones para prevenir la ocurrencia de no conformidades identificadas.',
                'Estas acciones se documentarán en el Plan de resolución de no conformidades y estas irán encaminadas a tomar medidas para controlarlas y corregirlas, y hacer frente a las consecuencias. Y si es necesario, se introducen cambios en el sistema de gestión de la seguridad de la información, si fuera necesario.',
              ],
              jsonData.nombreEmpresa
            ),

            new Paragraph({
              children: [new TextRun('')],
              pageBreakBefore: true,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'ANEXO I. Requisitos obligatorios del SGSI, según ISO/IEC 27001',
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
            this.createAnexoTabla(),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Tabla 1. Requisitos obligatorios del SGSI',
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
                  text: 'Guía de acrónimos.',
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
    
    const word = this.wordRepository.create({
      userId: jsonData.userId,
      content: buffer,
      fileName:fileName,
      creationDate: new Date(),
      modifyDate: new Date(),
      type: 2
    })
    try {
      const wordC= await this.wordRepository.save(word);
       return wordC
     } catch (error) {
 
       throw new Error(`Failed to save the word document: ${error.message}`);
 
     }  }

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
        const parts = item.split(/(-.*?-)/).map((part) => {
          if (part.startsWith('-') && part.endsWith('-')) {
            return new TextRun({ text: part.slice(1, -1), bold: true });
          } else {
            return new TextRun({ text: part.replace(/NOMBRE_EMPRESA/g, nombreEmpresa) });
          }
        });

        return new Paragraph({
          children: parts,
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

  createAnexoTabla(): Table {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Sección', bold: true })]
              })],
              width: { size: 10, type: WidthType.PERCENTAGE },
              shading: { fill: 'D9E2F3', type: ShadingType.CLEAR }
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Requisito ISO/IEC 27001', bold: true })]
              })],
              width: { size: 90, type: WidthType.PERCENTAGE },
              shading: { fill: 'D9E2F3', type: ShadingType.CLEAR }
            }),
          ],
        }),

        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '4', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'Contexto de la organización', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
          ]
        }),
        ...[
          { sub: '4.1', desc: 'Contexto organizacional', text: 'Determinar los objetivos del SGSI de la organización y cualquier cuestión que pueda comprometer su efectividad' },
          { sub: '4.2', desc: 'Partes interesadas', text: 'Identificar las partes interesadas incluyendo leyes aplicables, regulaciones, contratos, etc.' },
          { sub: '4.3', desc: 'Alcance del SGSI', text: 'Determinar y documentar el alcance del SGSI' },
          { sub: '4.4', desc: 'SGSI', text: 'Establecer, implementar, mantener y mejorar continuamente un SGSI de conformidad con la norma' }
        ].map(sub => [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.sub, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.desc, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('')],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.text })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          })
        ]).flat(),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '5', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'Liderazgo', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
          ]
        }),
        ...[
          { sub: '5.1', desc: 'Liderazgo y compromiso', text: 'La alta dirección debe demostrar liderazgo y compromiso en relación con el SGSI' },
          { sub: '5.2', desc: 'Política', text: 'Establecer la política de seguridad de la información' },
          { sub: '5.3', desc: 'Roles, responsabilidades y autoridades en la organización', text: 'Asegurar que los roles y responsabilidades de seguridad de la información son definidos y comunicados' }
        ].map(sub => [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.sub, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.desc, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('')],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.text })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          })
        ]).flat(),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '6', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'Planificación', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
          ]
        }),
        ...[
          { sub: '6.1', desc: 'Acciones para abordar los riesgos y oportunidades', text: 'Acciones para abordar los riesgos y oportunidades.' },
          { sub: '6.2', desc: 'Objetivos de seguridad de la información y planificación para lograrlos', text: 'Establecer y documentar los objetivos y planes de seguridad de la información.' },
          { sub: '6.3', desc: 'Planificación de cambios', text: 'Todos los cambios al SGSI son llevados a cabo de manera planificada...' }
        ].map(sub => [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.sub, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.desc, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('')],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.text })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          })
        ]).flat(),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '7', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'Soporte', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
          ]
        }),
        ...[
          { sub: '7.1', desc: 'Recursos', text: 'Determinar y proporcionar los recursos necesarios para el SGSI.' },
          { sub: '7.2', desc: 'Competencias', text: 'Determinar, documentar y poner a disposición las competencias necesarias.' },
          { sub: '7.3', desc: 'Concientización', text: 'Establecer un programa de concientización en seguridad.' },
          { sub: '7.4', desc: 'Comunicación', text: 'Determinar la necesidad para las comunicaciones internas y externas relevantes al SGSI.' },
          { sub: '7.5', desc: 'Información documentada', text: 'Proveer la documentación requerida por la norma así como lo requerido por la organización.' }
        ].map(sub => [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.sub, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.desc, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('')],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.text })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          })
        ]).flat(),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '8', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'Operación', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
          ]
        }),
        ...[
          { sub: '8.1', desc: 'Planificación y control operacional', text: 'Planificar, implementar, controlar y documentar el proceso del SGSI para gestionar los riesgos.' },
          { sub: '8.2', desc: 'Apreciación del riesgo de seguridad de la información', text: 'Realizar y documentar los riesgos de seguridad de la información en forma regular y ante cambios significativos.' },
          { sub: '8.3', desc: 'Tratamiento del riesgo de seguridad de la información', text: 'Implementar el plan de tratamiento de riesgos y documentar los resultados.' }
        ].map(sub => [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.sub, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.desc, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('')],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.text })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          })
        ]).flat(),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '9', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'Evaluación del desempeño', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
          ]
        }),
        ...[
          { sub: '9.1', desc: 'Seguimiento, medición, análisis y evaluación', text: 'Hacer seguimiento, medir, analizar y evaluar el SGSI y los controles.' },
          { sub: '9.2', desc: 'Auditoría interna', text: 'Planificar y llevar a cabo auditorías internas del SGSI.' },
          { sub: '9.3', desc: 'Revisión por la dirección', text: 'Realizar revisiones por la dirección del SGSI regularmente.' }
        ].map(sub => [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.sub, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.desc, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('')],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.text })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          })
        ]).flat(),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '10', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'Mejora', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
          ]
        }),
        ...[
          { sub: '10.1', desc: 'Mejora continua', text: 'Mejorar continuamente el SGSI.' },
          { sub: '10.2', desc: 'No conformidad y acciones correctivas', text: 'Identificar, corregir y llevar a cabo acciones para prevenir la recurrencia de no conformidades, documentar las acciones.' }
        ].map(sub => [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.sub, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.desc, bold: true })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph('')],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              }),
              new TableCell({
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: sub.text })]
                })],
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
              })
            ]
          })
        ]).flat(),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Sección', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Requisito ISO/IEC 27001', bold: true })]
              })],
              shading: { fill: 'B7DEE8', type: ShadingType.CLEAR }
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('')],
              shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [new TextRun({ text: 'Identificar, corregir y llevar a cabo acciones para prevenir la recurrencia de no conformidades, documentando las acciones' })]
              })],
              shading: { fill: 'FFFFFF', type: ShadingType.CLEAR }
            })
          ]
        })
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
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' }
      },
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
                fill: "D9E2F3",
              },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: "Descripción", bold: true })],
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

  async deleteWord(id: number): Promise<void> {
    const pdf = await this.wordRepository.findOneBy({ id  });
    if (!pdf) {
      throw new Error('PDF not found');
    }

    await this.wordRepository.delete(id);
  }

}