import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { EventsGateway } from '../socket/websocket.gateway';
import { NotFoundException } from '@nestjs/common';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let prismaService: PrismaService;
  let eventsGateway: EventsGateway;

  // Mock data

   const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockTransaction = {
    id: 'transaction-id',
    amount: 100,
    description: 'Test transaction',
    userId: 'user-id',
    groupId: 'group-id',
  };

  const mockCreateTransactionDto: CreateTransactionDto = {
    amount: 100,
    description: 'Test transaction',
    userId: 'user-id',
    category: 'food',
    groupId: 'group-id',
  };

  const mockEventsGateway = {
    broadcastToTransactionRoom: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: EventsGateway, useValue: mockEventsGateway },
        {
          provide: PrismaService,
          useValue: {
            transaction: {
              create: jest.fn().mockResolvedValue(mockTransaction),
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              delete: jest.fn().mockResolvedValue(mockTransaction),
            },
          },
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    prismaService = module.get<PrismaService>(PrismaService);
    eventsGateway = module.get<EventsGateway>(EventsGateway);
  });

  it('should be defined', () => {
    expect(transactionService).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      // Mock the Prisma create method
      (prismaService.transaction.create as jest.Mock).mockResolvedValue(
        mockTransaction,
      );

      // Call the method under test with the correct argument order
      const result = await transactionService.createTransaction(
        mockUser.id,
        mockCreateTransactionDto, // DTO should be the first argument
         // User object should be the second argument
      );

      // Assertions
      expect(result).toEqual(mockTransaction);

      // Verify the correct arguments were passed to Prisma
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: mockCreateTransactionDto.amount,
          description: mockCreateTransactionDto.description,
          category: mockCreateTransactionDto.category,
          createdBy: { connect: { id: mockUser.id } }, // userId is transformed into createdBy
          group: { connect: { id: mockCreateTransactionDto.groupId } }, // groupId is transformed into group
        },
      });

      // Verify that the event was broadcast
      expect(eventsGateway.broadcastToTransactionRoom).toHaveBeenCalled();
    });
  });  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      const result = await transactionService.createTransaction(
        mockUser.id,
        mockCreateTransactionDto,
      );

      expect(result).toEqual(mockTransaction);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
  data: {
    amount: mockCreateTransactionDto.amount,
    description: mockCreateTransactionDto.description,
    category: mockCreateTransactionDto.category,
    createdBy: { connect: { id: mockUser.id } },
    group: { connect: { id: mockCreateTransactionDto.groupId } }, // ✅ Fix: Match how the service connects the group
  },
      });
    });
  });

   describe('getTransactionById', () => {
    it('should return a transaction by id', async () => {
      const result = await transactionService.getTransactionById(
        mockTransaction.id,
      );

      expect(result).toEqual(mockTransaction);
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: mockTransaction.id },
        include: {
          createdBy: true,
          updatedBy: true,
        },
      });
    });

    it('should throw NotFoundException if transaction is not found', async () => {
      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValueOnce(null);

      // Assert that the method throws NotFoundException
      await expect(
        transactionService.getTransactionById('non-existent-id'),
      ).rejects.toThrow('Transaction not found');

      // Verify that the correct query was made to Prisma
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        include: {
          createdBy: true,
          updatedBy: true,
        },
      });
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      const result = await transactionService.deleteTransaction(
        mockTransaction.id,
        mockUser.id,
        mockTransaction.groupId,
      );

      expect(result).toEqual(mockTransaction);
      expect(prismaService.transaction.delete).toHaveBeenCalledWith({
        where: { id: mockTransaction.id },
      });
    });
  });
});
