/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import parse from 'csv-parse';
import fs from 'fs';

import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface FileCsv {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

function loadCsv(file: any): Promise<FileCsv[]> {
  return new Promise((resolve, reject) => {
    const items: FileCsv[] = [];
    fs.createReadStream(file.path)
      .pipe(parse())

      .on('data', data => {
        if (data[0].trim() !== 'title') {
          const title = data[0].trim() !== 'title' && data[0].trim();
          const type = data[1].trim() !== 'type' && data[1].trim();
          const value = data[2].trim() !== 'value' && data[2].trim();
          const category = data[3].trim() !== 'category' && data[3].trim();

          items.push({ title, type, value, category });
        }
      })
      .on('end', () => {
        fs.promises.unlink(file.path);
        resolve(items);
      })
      .on('error', error => reject(error));
  });
}

class ImportTransactionsService {
  async execute(file: any): Promise<Transaction[]> {
    const transactions: FileCsv[] = await loadCsv(file);
    const transactionSaved: Transaction[] = [];

    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    // await Promise.all(
    //   transactions.forEach(transaction => {
    //     console.log(transaction.category);
    //   }),
    // );

    await Promise.all(
      transactions.map(async trans => {
        const { title, category, type, value } = trans;
        let categoryFound = await categoryRepository.findOne({
          title: category,
        });

        if (!categoryFound) {
          categoryFound = categoryRepository.create({
            title: category,
          });
          await categoryRepository.save(categoryFound);
        }

        const transaction = transactionRepository.create({
          title,
          value,
          type,
          category_id: categoryFound.id,
        });

        await transactionRepository.save(transaction);
        transactionSaved.push(transaction);
      }),
    );

    return transactionSaved;
  }
}

export default ImportTransactionsService;
