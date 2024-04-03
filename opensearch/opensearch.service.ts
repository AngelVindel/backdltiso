import { Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class AppService {
  constructor(private readonly opensearch: Client) {}

  async search(query: string) {
    const result = await this.opensearch.search({
      index: 'my-index',
      query: {
        match: {
          text: query,
        },
      },
    });

    return result;
  }
}
