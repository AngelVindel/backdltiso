import { Module } from '@nestjs/common';
import { OpensearchModule } from 'nestjs-opensearch';

@Module({
  imports: [
    OpensearchModule.register({
      node: 'http://localhost:9200',
    }),
  ],
})
export class AppModule {}
