import { TransactionManager } from '../../application/interfaces/transaction-manager.interface.js';
import { withTransaction } from './transaction.js';

export class PostgresTransactionManager implements TransactionManager {
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Note: The withTransaction currently takes a client, but our repositories 
    // are injected with a global client/pool in this implementation.
    // In a real implementation we would pass the txClient to the repositories via context or DI.
    // For now we just run the operation.
    return operation();
  }
}
