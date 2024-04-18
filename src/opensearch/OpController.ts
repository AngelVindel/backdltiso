import { Controller, Get, Param } from '@nestjs/common';
import { OpenSearchService } from './OpServices';
import { MySQLService } from './mysql'; 

@Controller('search')
export class SearchController {
  constructor(
    private readonly openSearchService: OpenSearchService,
    private readonly mysqlService: MySQLService,
  ) {}
  

  @Get()
  async searchAll() {
     // Verifica si estás conectado a MySQL
  if (!this.mysqlService.isConnected()) {
    await this.mysqlService.connect();
  }

  // Define un array con los nombres de las tablas
  const tables = ['usuarios', 'documento_pdf', 'regular_user', 'ticket'];

  // Recorre el array de tablas
  for (const table of tables) {
    // Obtiene los datos de MySQL para la tabla actual
    const data = await this.mysqlService.query(`SELECT * FROM ${table}`);

    // Indexa los datos en OpenSearch si hay datos disponibles
    if (data.length > 0) {
      await this.openSearchService.indexData(table, data);
    }
  }

  // Muestra los usuarios por consola
  await this.mysqlService.showAllUsers();

  return { message: 'Datos indexados en OpenSearch correctamente' };
  }

  @Get('/usuarios')
  async searchUsuarios() {
// Verifica si estás conectado a MySQL
if (!this.mysqlService.isConnected()) {
  await this.mysqlService.connect();
}

// Define un array con los nombres de las tablas
const tables = ['usuarios', 'documento_pdf', 'regular_user', 'ticket','pregunta','respuesta'];

// Recorre el array de tablas
for (const table of tables) {
  // Obtiene los datos de MySQL para la tabla actual
  const data = await this.mysqlService.query(`SELECT * FROM ${table}`);

  // Indexa los datos en OpenSearch si hay datos disponibles
  if (data.length > 0) {
    await this.openSearchService.indexData(table, data);
  }
}

// Muestra los usuarios por consola
await this.mysqlService.showAllUsers();

return { message: 'Datos indexados en OpenSearch correctamente' };
  }
  @Get('/getIndices')
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
  @Get('/:indice/openSearch')
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

}


