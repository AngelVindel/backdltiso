/* eslint-disable prettier/prettier */
// mysql.ts
import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2';

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
      password: '123abc',
      database: 'prueba2',
    });

    this.connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
      }
      console.log('Successfully connected to MySQL database');
      this.executeQuery();
    });
  }

  private executeQuery() {
    // Example query to select data from a table named 'regular_user'
    const query = 'SELECT * FROM admin_user';

    this.connection.query(query, (error, results, fields) => {
      if (error) {
        console.error('Error executing query:', error);
        return;
      }

      // Log the results to the console
      console.log('Query results:', results);
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
      console.log('Users:', users);
    } catch (error) {
      console.error('Error fetching users from database:', error);
    }
  }
}
