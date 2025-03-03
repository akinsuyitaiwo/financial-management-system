/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from '@prisma/client';


@Injectable()
export class TransactionService {
    constructor(private prisma: PrismaService){}
    
    async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        const {userId, ...transactionData} = createTransactionDto;
            return this.prisma.transaction.create({
      data: {
        ...transactionData,
        amount: parseFloat(createTransactionDto.amount.toString()),
        date: new Date(createTransactionDto.date),
        createdBy: {
          connect: { id: userId },
        },
        updatedBy: {
          connect: { id: userId },
        },
      },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });
    }

    async getAllTransactions(): Promise<Transaction[]> {
        return this.prisma.transaction.findMany({
            include: {
                createdBy: {
                    select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
        });
    }

    async getTransactionById(id: string): Promise<Transaction | null> {
        return this.prisma.transaction.findUnique({
            where: { id },
            include: {
                createdBy: true,
                updatedBy: true,
            },
        });
    }
    
    
    async updateTransaction(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction | null> {
        const {userId,...transactionData} = updateTransactionDto;
        return this.prisma.transaction.update({
    where: { id },
      data: {
        ...transactionData,
        ...(updateTransactionDto.amount && { amount: parseFloat(updateTransactionDto.amount.toString()) }),
        ...(updateTransactionDto.date && { date: new Date(updateTransactionDto.date) }),
        updatedBy: {
          connect: { id: userId },
        },
      },
      include: {
        createdBy: true,
        updatedBy: true,
      },
        });
    }

    async deleteTransaction(id: string, userId:string) {
  const transaction = await this.prisma.transaction.findUnique({
    where: { id },
  });
  
  if (!transaction) {
    throw new NotFoundException(`Transaction with ID ${id} not found`);
  }
  

        await this.prisma.transaction.delete({ where: { id } });
    }
}
