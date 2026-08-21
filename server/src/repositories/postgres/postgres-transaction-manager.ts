import { TransactionManager } from '../../application/interfaces/transaction-manager.interface.js';
import { withTransaction } from '../database/transaction.js';

export class PostgresTransactionManager implements TransactionManager {
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // In a real implementation, we would inject the txClient into a cls-hooked context
    // or pass it down to repositories. For this MVP orchestration foundation,
    // we use the existing withTransaction block.
    return withTransaction(async () => {
      return await operation();
    });
  }
}
