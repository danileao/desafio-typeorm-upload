// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const transaction = await transactionRepository.findOne({
      id,
    });
    if (!transaction) {
      throw new AppError('Transaction does not exists!');
    }
    await transactionRepository.delete(transaction.id);
  }
}

export default DeleteTransactionService;
