import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import uploadConfig from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();
  return response.json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();
  const createTransaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(createTransaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);
  return response.status(200).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;
    const importTransactionService = new ImportTransactionsService();
    const transactionsSaved = await importTransactionService.execute(file);

    return response.json(transactionsSaved);
  },
);

export default transactionsRouter;
