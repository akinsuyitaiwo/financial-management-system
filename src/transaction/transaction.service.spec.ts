import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../socket/websocket.gateway';
import { NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let prismaService: PrismaService;
  let eventsGateway: EventsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: PrismaService,
          useValue: {
            transaction: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: EventsGateway,
          useValue: {
            broadcastToTransactionRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    prismaService = module.get<PrismaService>(PrismaService);
    eventsGateway = module.get<EventsGateway>(EventsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a transaction and broadcast an event', async () => {
      const userId = 'user123';
      const createTransactionDto: CreateTransactionDto = {
        amount: 100,
        description: 'Test Transaction',
        category: 'Groceries',
        groupId: 'group123',
      };

      const mockTransaction = {
        id: 'txn123',
        ...createTransactionDto,
        createdById: userId,
      };

      jest
        .spyOn(prismaService.transaction, 'create')
        .mockResolvedValue(mockTransaction as any);

      const result = await transactionService.createTransaction(
        userId,
        createTransactionDto,
      );

      expect(result).toEqual(mockTransaction);
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: createTransactionDto.amount,
          description: createTransactionDto.description,
          category: createTransactionDto.category,
          createdBy: { connect: { id: userId } },
          group: { connect: { id: createTransactionDto.groupId } },
        },
      });

      expect(eventsGateway.broadcastToTransactionRoom).toHaveBeenCalledWith(
        createTransactionDto.groupId,
        'transaction_created',
        mockTransaction,
      );
    });
  });

  describe('getAllTransactions', () => {
    it('should return all transactions', async () => {
      const mockTransactions = [
        { id: 'txn1', amount: 50, description: 'Groceries' },
        { id: 'txn2', amount: 200, description: 'Electronics' },
      ];

      jest
        .spyOn(prismaService.transaction, 'findMany')
        .mockResolvedValue(mockTransactions as any);

      const result = await transactionService.getAllTransactions();

      expect(result).toEqual(mockTransactions);
      expect(prismaService.transaction.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTransactionById', () => {
    it('should return a transaction if found', async () => {
      const mockTransaction = {
        id: 'txn123',
        amount: 100,
        description: 'Test',
      };

      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(mockTransaction as any);

      const result = await transactionService.getTransactionById('txn123');

      expect(result).toEqual(mockTransaction);
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'txn123' },
        include: { createdBy: true, updatedBy: true },
      });
    });

    it('should throw NotFoundException if transaction is not found', async () => {
      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        transactionService.getTransactionById('txn123'),
      ).rejects.toThrow(new NotFoundException('Transaction not found'));
    });
  });

  describe('updateTransaction', () => {
    it('should update a transaction and broadcast an event', async () => {
      const updateTransactionDto: UpdateTransactionDto = {
        amount: 150,
        description: 'Updated transaction',
      };

      const mockExistingTransaction = { id: 'txn123', groupId: 'group123' };
      const mockUpdatedTransaction = {
        ...mockExistingTransaction,
        ...updateTransactionDto,
      };

      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(mockExistingTransaction as any);
      jest
        .spyOn(prismaService.transaction, 'update')
        .mockResolvedValue(mockUpdatedTransaction as any);

      const result = await transactionService.updateTransaction(
        'txn123',
        updateTransactionDto,
      );

      expect(result).toEqual(mockUpdatedTransaction);
      expect(prismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn123' },
        data: updateTransactionDto,
        include: { createdBy: true, updatedBy: true, group: true },
      });

      expect(eventsGateway.broadcastToTransactionRoom).toHaveBeenCalledWith(
        mockExistingTransaction.groupId,
        'transaction_updated',
        mockUpdatedTransaction,
      );
    });

    it('should throw NotFoundException if transaction is not found', async () => {
      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        transactionService.updateTransaction(
          'txn123',
          {} as UpdateTransactionDto,
        ),
      ).rejects.toThrow(new NotFoundException('Transaction not found'));
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction and broadcast an event', async () => {
      const mockTransaction = { id: 'txn123', groupId: 'group123' };

      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(mockTransaction as any);
      jest
        .spyOn(prismaService.transaction, 'delete')
        .mockResolvedValue(mockTransaction as any);

      await transactionService.deleteTransaction(
        'txn123',
        'user123',
        'group123',
      );

      expect(prismaService.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'txn123' },
      });

      expect(eventsGateway.broadcastToTransactionRoom).toHaveBeenCalledWith(
        'group123',
        'transaction_deleted',
        mockTransaction,
      );
    });

    it('should throw NotFoundException if transaction is not found', async () => {
      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        transactionService.deleteTransaction('txn123', 'user123', 'group123'),
      ).rejects.toThrow(
        new NotFoundException('Transaction with ID txn123 not found'),
      );
    });
  });
});
