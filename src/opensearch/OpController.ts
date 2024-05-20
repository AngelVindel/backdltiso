import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { OpenSearchService } from './OpServices';
import { MySQLService } from './mysql'; 
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('OpenSearch')
@Controller('search')
export class SearchController {
  constructor(
    private readonly openSearchService: OpenSearchService,
    private readonly mysqlService: MySQLService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Indexar datos de todas las tablas en OpenSearch' })
  async indexTablesData() {
    try {
      // Verifica si estás conectado a MySQL
      if (!this.mysqlService.isConnected()) {
        await this.mysqlService.connect();
      }
  
      // Obtiene los nombres de todas las tablas en la base de datos actual
      const tables = await this.mysqlService.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'prueba2'`
      );
  
      // Extrae los nombres de las tablas de los resultados
      const tableNames = tables.map((table: any) => table.table_name);
  
      // Recorre el array de nombres de las tablas
      for (const tableName of tableNames) {
        // Obtiene los datos de la tabla actual
        const data = await this.mysqlService.query(`SELECT * FROM ${tableName}`);
  
        if (data.length > 0) {
          await this.openSearchService.indexData(tableName, data);
          console.log(`La tabla ${tableName} se ha indexado correctamente`);
        }
      }
  
      return { message: 'Datos indexados en OpenSearch correctamente' };
    } catch (error) {
      console.error('Error al indexar datos en OpenSearch:', error);
      throw error;
    }
  }
  @Get('/usuarios')
  @ApiOperation({ summary: 'Buscar datos de usuarios en OpenSearch' })
  async searchUsuarios() {
    try {
      // Verifica si estás conectado a MySQL
      if (!this.mysqlService.isConnected()) {
        await this.mysqlService.connect();
      }

      // Define un array con los nombres de las tablas
      const tables = ['admin_user', 'answer', 'pdf_doc', 'question','regular_user','ticket'];

      // Recorre el array de tablas
      for (const table of tables) {
        // Obtiene los datos de MySQL para la tabla actual
        const data = await this.mysqlService.query(`SELECT * FROM ${table}`);

        // Indexa los datos en OpenSearch si hay datos disponibles
        if (data.length > 0) {
          await this.openSearchService.indexData(table, data);
          console.log(`La tabla ${table} se ha indexado correctamente`);
        }
      }

      return { message: 'Datos indexados en OpenSearch correctamente' };
    } catch (error) {
      console.error('Error al indexar datos en OpenSearch:', error);
      throw error;
    }
  }

  @Get('/getIndices')
  @ApiOperation({ summary: 'Obtener todos los índices en OpenSearch' })
  async getIndices() {
    try {
      // Obtiene los índices de OpenSearch
      const indices = await this.openSearchService.getIndices();
 
      // Formatea los datos para devolver solo el nombre del índice y su tamaño
      const formattedIndices = indices.map(index => ({
        name: index.index,
        size: index.storeSize
      }));
 
      return formattedIndices;
    } catch (error) {
      console.error('Error al obtener los índices:', error);
      throw error;
    }
  }

  @Get('/:indice/all')
  @ApiOperation({ summary: 'Buscar todos los datos de un índice en OpenSearch' })
  async searchOpenSearch(@Param('indice') indice: string) {
    try {
      // Realiza una consulta a OpenSearch para obtener los datos del índice especificado por el usuario
      const datos = await this.openSearchService.getIndexData(indice);

      // Retorna los datos obtenidos
      return datos;
    } catch (error) {
      console.error(`Error al obtener los datos desde OpenSearch para el índice ${indice}:`, error);
      throw error;
    }
  }

  @Get('/:index/openSearch')
  @ApiOperation({ summary: 'Buscar datos por palabras clave en un índice en OpenSearch' })
  async searchKey(
    @Param('index') index: string,
    @Query('keywords') keywords: string,
  ) {
    try {
      // Realiza una consulta a OpenSearch para buscar las palabras clave en el índice especificado por el usuario
      const result = await this.openSearchService.searchIndexByKeywords(
        index,
        keywords,
      );

      // Retorna los datos obtenidos
      return result;
    } catch (error) {
      console.error(
        `Error al buscar datos en OpenSearch para el índice ${index}:`,
        error,
      );
      throw error;
    }
  }

  @Get('/:indice')
@ApiOperation({ summary: 'Indexar datos de una tabla en OpenSearch' })
async indexar(@Param('indice') indice: string) {
  try {
    if (!this.mysqlService.isConnected()) {
      await this.mysqlService.connect();
    }

    const tabla = indice;
    const data = await this.mysqlService.query(`SELECT * FROM ${tabla}`);

    // Indexa los datos en OpenSearch si hay datos disponibles
    if (data.length > 0) {
      await this.openSearchService.indexData(tabla, data);
      console.log(`La tabla ${tabla} se ha indexado correctamente`);
      return { message: 'Datos indexados en OpenSearch correctamente' };
    } else {
      console.log(`No hay datos disponibles en la tabla ${tabla}`);
      return { message: 'No hay datos disponibles para indexar en OpenSearch' };
    }
  } catch (error) {
    console.error(`Error al indexar datos de la tabla  en OpenSearch:`, error);
    throw error;
  }
}
  @Delete('/delete/:indice')
  @ApiOperation({ summary: 'Eliminar un índice de OpenSearch' })
  async deleteIndex(@Param('indice') indice: string) {
    try {
      // Llama al método de servicio para eliminar el índice
      await this.openSearchService.deleteIndex(indice);

      return { message: `Índice ${indice} borrado correctamente` };
    } catch (error) {
      console.error(`Error al borrar el índice ${indice}:`, error);
      throw error;
    }
  }


  @Get('/:index/searchPhrase')
  async searchPhrase(
    @Param('index') index: string,
    @Query('field') field: string,
    @Query('query') query: string,
    @Query('slop') slop: number
  ) {
    try {
      const result = await this.openSearchService.searchPhrase(index, field, query, slop);
      return result;
    } catch (error) {
      console.error('Error al buscar la frase en OpenSearch:', error);
      throw error;
    }
  } 

  @Get('/questions')
  @ApiOperation({ summary: 'Buscar preguntas por email en OpenSearch' })
  async searchQuestionsByEmail(@Query('email') email: string) {
    try {
      // Asegúrate de usar el índice correcto donde se almacenan las preguntas
      const index = 'questionai';
      const result = await this.openSearchService.searchQuestionsByEmail(index, email);
      return result;
    } catch (error) {
      console.error(`Error al buscar preguntas por email en OpenSearch:`, error);
      throw error;
    }
  }
}


