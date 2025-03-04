import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from '@prisma/client';
import { EventsGateway } from '../socket/websocket.gateway';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createTransaction(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: createTransactionDto.amount,
        description: createTransactionDto.description,
        category: createTransactionDto.category,
        createdBy: {
          connect: { id: userId },
        },
        group: {
          connect: { id: createTransactionDto.groupId },
        },
      },
    });
    this.eventsGateway.broadcastToTransactionRoom(
      createTransactionDto.groupId,
      'transaction_created',
      transaction,
    ); // Broadcast update

    return transaction;
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
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        createdBy: true,
        updatedBy: true,
      },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction not found`);
    }
    return transaction;
  }

  async updateTransaction(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    const { ...transactionData } = updateTransactionDto;
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction not found`);
    }

    const updatedData = await this.prisma.transaction.update({
      where: { id },
      data: transactionData,

      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
      },
    });
    // Broadcast a message to everyone in the transaction room
    this.eventsGateway.broadcastToTransactionRoom(
      transaction.groupId,
      'transaction_updated',
      updatedData,
    );
    return updatedData;
  }

  async deleteTransaction(
    id: string,
    userId: string,
    groupId: string,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },

      include: {
        deletedBy: true,
        group: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const deletedData = await this.prisma.transaction.delete({ where: { id } });
    this.eventsGateway.broadcastToTransactionRoom(
      groupId,
      'transaction_deleted',
      deletedData,
    );
    return deletedData;
  }
}
