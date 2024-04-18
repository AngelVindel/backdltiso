// mysql.ts
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';

@Injectable()
export class MySQLService {
  private connection;

  constructor() {
    this.connect();
  }

  public connect() {
    this.connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dltcode'
    });

    this.connection.connect((err) => {
      if (err) {
        console.error('Error al conectar a la base de datos MySQL:', err);
        return;
      }
      console.log('Conexión exitosa a la base de datos MySQL');
      this.executeQuery();
    });
  }


  private executeQuery() {
    // Ejemplo de consulta a una tabla llamada 'usuarios'
    const query = 'SELECT * FROM regular_user';

    this.connection.query(query, (error, results, fields) => {
      if (error) {
        console.error('Error al ejecutar la consulta:', error);
        return;
      }

      // Mostrar los resultados por consola
      console.log('Resultados de la consulta:', results);
    });
  }

  isConnected(): boolean {
    return this.connection && this.connection.state === 'authenticated';
  }

  async query(sql: string, values?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, values, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  async showAllUsers(): Promise<void> {
    try {
      const users = await this.query('SELECT * FROM documento_pdf');
      console.log('Usuarios:', users);
    } catch (error) {
      console.error('Error al obtener usuarios de la base de datos:', error);
    }
  }
}

