import { NetworkRepository } from '../interfaces/network.repository.js';
import { NetworkSnapshot } from '../../domain/entities/index.js';
import { DatabaseClient } from '../../infrastructure/database/client.js';

export class PostgresNetworkRepository implements NetworkRepository {
  constructor(private db: DatabaseClient) {}

  async getLatestSnapshot(): Promise<NetworkSnapshot | null> {
    const result = await this.db.query<NetworkSnapshot>(
      'SELECT * FROM network_snapshots ORDER BY created_at DESC LIMIT 1'
    );
    return result.rows[0] || null;
  }
}
