import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { EventsGateway } from '../socket/websocket.gateway';

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
      const result = await transactionService.createTransaction(
        mockUser.id,
        mockCreateTransactionDto,
      );

      expect(result).toEqual(mockTransaction);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateTransactionDto,
          createdBy: { connect: { id: mockUser.id } },
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
      });
    });

    it('should return null if transaction is not found', async () => {
      jest
        .spyOn(prismaService.transaction, 'findUnique')
        .mockResolvedValueOnce(null);

      const result =
        await transactionService.getTransactionById('non-existent-id');

      expect(result).toBeNull();
      expect(prismaService.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
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
