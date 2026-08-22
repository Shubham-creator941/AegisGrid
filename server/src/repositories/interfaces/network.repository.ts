import { NetworkSnapshot } from '../../domain/entities/index.js';

export interface NetworkRepository {
  getLatestSnapshot(): Promise<NetworkSnapshot | null>;
}
