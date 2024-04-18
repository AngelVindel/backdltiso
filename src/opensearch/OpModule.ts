import { Module } from '@nestjs/common';
import { OpenSearchService } from './OpServices';
import { SearchController } from './OpController';
import { MySQLService } from './mysql'; // Importa el servicio de MySQL

@Module({
  controllers: [SearchController],
  providers: [OpenSearchService, MySQLService], // Agrega el servicio de MySQL a los providers
})
export class AppModule {}
