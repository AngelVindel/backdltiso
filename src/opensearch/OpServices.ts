import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpenSearchService {
  private readonly client: Client;
  private lastIndexedId: number = 0; // Variable para almacenar el último ID indexado

  constructor() {
    this.client = new Client({
      node: 'http://localhost:9200', // URL de tu instancia de OpenSearch
    });

    this.client.ping((error) => {
      if (error) {
        console.error('Error al conectar a OpenSearch:', error);
      } else {
        console.log('Conexión exitosa a OpenSearch');
      }
    });
  }

  async getLastIndexedId(): Promise<number> {
    // Implementa la lógica para obtener el último ID indexado desde OpenSearch o desde una variable local
    return this.lastIndexedId;
  }

  async indexData(index: string, data: any[]) {
    // Verifica si hay nuevos datos en la base de datos desde el último índice
    const lastIndexedId = await this.getLastIndexedId();
    const newData = data.filter(item => item.id > lastIndexedId);

    // Indexa los nuevos datos en OpenSearch
    if (newData.length > 0) {
      await this.client.bulk({
        index,
        body: newData.flatMap(doc => [{ index: { _index: index } }, doc]),
      });
      
      // Actualiza el último ID indexado
      const newLastIndexedId = newData[newData.length - 1].id;
      this.lastIndexedId = newLastIndexedId;
    }
  }

  async search(index: string, query: object) {
    return this.client.search({
      index,
      body: query,
    });
  }

  async getIndices() {
    try {
      // Realiza una solicitud al endpoint de Cat Indices para obtener información sobre los índices
      const { body } = await this.client.cat.indices({ format: 'json', h: 'index,store.size' });
 
      // Retorna los datos obtenidos
      return body;
    } catch (error) {
      console.error('Error al obtener los índices desde OpenSearch:', error);
      throw error;
    }
  }

  async getIndexData(indexName: string) {
    try {
      const { body } = await this.client.search({
        index: indexName,
        body: { query: { match_all: {} } },
      });
      return body.hits.hits;
    } catch (error) {
      console.error('Error al obtener los datos del índice desde OpenSearch:', error);
      throw error;
    }
  }

  async searchIndexByKeywords(index: string, keywords: string): Promise<any> {
    const { body } = await this.client.search({
      index,
      body: {
        query: {
          match: { _all: keywords }, // Busca las palabras clave en todos los campos
        },
      },
    });
    return body.hits.hits;
  }

  async deleteIndex(indexName: string): Promise<void> {
    try {
      // Realiza la solicitud DELETE para eliminar el índice
      await this.client.indices.delete({
        index: indexName,
      });
      console.log(`Índice ${indexName} borrado correctamente`);
    } catch (error) {
      console.error(`Error al borrar el índice ${indexName}:`, error);
      throw error;
    }
  }

  async searchPhrase(index: string, field: string, query: string, slop: number) {
    try {
      const body = {
        query: {
          match_phrase: {
            [field]: {
              query,
              slop
            },
          },
        },
      };
      
      const { body: result } = await this.client.search({ index, body });
      return result.hits.hits;
    } catch (error) {
      console.error('Error al buscar la frase en OpenSearch:', error);
      throw error;
    }
  }

  
}
