import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CanActivate, ExecutionContext } from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: TransactionService;

  const mockAuthGuard: jest.Mocked<CanActivate> = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 'user-1' }; // Mock authenticated user
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            createTransaction: jest.fn(),
            getAllTransactions: jest.fn(),
            getTransactionById: jest.fn(),
            updateTransaction: jest.fn(),
            deleteTransaction: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a transaction and return the created transaction', async () => {
      const createTransactionDto: CreateTransactionDto = {
        amount: 100,
        description: 'Groceries',
        category: 'Food',
        groupId: 'group-1',
      };

      const mockTransaction = {
        id: 'transaction-1',
        amount: 100,
        description: 'Groceries',
        category: 'Food',
        date: new Date('2023-10-01'), // Add the missing `date` field
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'user-1',
        updatedById: 'user-1', // Ensure this matches the expected type (string | null)
        deletedById: null, // Add the missing `deletedById` field
        groupId: 'group-1',
      };

      jest
        .spyOn(transactionService, 'createTransaction')
        .mockResolvedValue(mockTransaction);

      const result = await controller.createTransaction(
        { user: { id: 'user-1' } },
        createTransactionDto,
      );

      expect(result).toEqual(mockTransaction);
      expect(transactionService.createTransaction).toHaveBeenCalledWith(
        'user-1',
        createTransactionDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      const mockTransactions = [
        {
          id: 'transaction-1',
          amount: 100,
          description: 'Groceries',
          category: 'Food',
          date: new Date('2023-10-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
          createdById: 'user-1',
          updatedById: 'user-1',
          deletedById: null,
          groupId: 'group-1',
        },
      ];

      jest
        .spyOn(transactionService, 'getAllTransactions')
        .mockResolvedValue(mockTransactions);

      const result = await controller.findAll();

      expect(result).toEqual(mockTransactions);
      expect(transactionService.getAllTransactions).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a transaction by ID', async () => {
      const transactionId = 'transaction-1';
      const mockTransaction = {
        id: transactionId,
        amount: 100,
        description: 'Groceries',
        category: 'Food',
        date: new Date('2023-10-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'user-1',
        updatedById: 'user-1',
        deletedById: null,
        groupId: 'group-1',
      };

      jest
        .spyOn(transactionService, 'getTransactionById')
        .mockResolvedValue(mockTransaction);

      const result = await controller.findOne(transactionId);

      expect(result).toEqual(mockTransaction);
      expect(transactionService.getTransactionById).toHaveBeenCalledWith(
        transactionId,
      );
    });
  });

  describe('update', () => {
    it('should update a transaction and return the updated transaction', async () => {
      const transactionId = 'transaction-1';
      const updateTransactionDto: UpdateTransactionDto = {
        amount: 200,
        description: 'Updated Groceries',
      };

      const mockUpdatedTransaction = {
        id: transactionId,
        amount: 200,
        description: 'Updated Groceries',
        category: 'Food',
        date: new Date('2023-10-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'user-1',
        updatedById: 'user-1',
        deletedById: null,
        groupId: 'group-1',
      };

      jest
        .spyOn(transactionService, 'updateTransaction')
        .mockResolvedValue(mockUpdatedTransaction);

      const result = await controller.update(
        transactionId,
        updateTransactionDto,
      );

      expect(result).toEqual(mockUpdatedTransaction);
      expect(transactionService.updateTransaction).toHaveBeenCalledWith(
        transactionId,
        updateTransactionDto,
      );
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction and return the deleted transaction', async () => {
      const transactionId = 'transaction-1';
      const userId = 'user-1';
      const groupId = 'group-1';

      const mockDeletedTransaction = {
        id: transactionId,
        amount: 100,
        description: 'Groceries',
        category: 'Food',
        date: new Date('2023-10-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'user-1',
        updatedById: 'user-1',
        deletedById: null,
        groupId: 'group-1',
      };

      jest
        .spyOn(transactionService, 'deleteTransaction')
        .mockResolvedValue(mockDeletedTransaction);

      const result = await controller.deleteTransaction( transactionId,
        userId,
        groupId,
      );

      expect(result).toEqual(mockDeletedTransaction);
      expect(transactionService.deleteTransaction).toHaveBeenCalledWith(
        transactionId,
        userId,
        groupId,
      );
    });
  });
});
