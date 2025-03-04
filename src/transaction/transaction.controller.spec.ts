import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

// Mock AuthGuard
const mockAuthGuard = {
  canActivate: (context: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    req.user = { id: 'user-id' }; // Mock user
    return true;
  },
};

// Mock data
const mockTransaction = {
  id: 'transaction-id',
  amount: 100,
  description: 'Test transaction',
  category: 'Test category',
  groupId: 'group-id',
  userId: 'user-id',
};

const mockCreateTransactionDto: CreateTransactionDto = {
  amount: 100,
  description: 'Test transaction',
  category: 'Test category',
  groupId: 'group-id',
  userId: 'user-id',
};

const mockUpdateTransactionDto: UpdateTransactionDto = {
  amount: 200,
  description: 'Updated transaction',
  type: 'income',
  date: '2023-10-01',
  groupId: 'updated-group-id',
};

// Mock TransactionService
const mockTransactionService = {
  createTransaction: jest.fn().mockResolvedValue(mockTransaction),
  getAllTransactions: jest.fn().mockResolvedValue([mockTransaction]),
  getTransactionById: jest.fn().mockResolvedValue(mockTransaction),
  updateTransaction: jest.fn().mockResolvedValue(mockTransaction),
  deleteTransaction: jest.fn().mockResolvedValue(mockTransaction),
};

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt')) // Override AuthGuard
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      const req = { user: { id: 'user-id' } }; // Mock request object
      const result = await controller.createTransaction(
        req,
        mockCreateTransactionDto,
      );

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(
        'user-id',
        mockCreateTransactionDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of transactions', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockTransaction]);
      expect(mockTransactionService.getAllTransactions).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const result = await controller.findOne('transaction-id');

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionService.getTransactionById).toHaveBeenCalledWith(
        'transaction-id',
      );
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const result = await controller.update(
        'transaction-id',
        mockUpdateTransactionDto,
      );

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionService.updateTransaction).toHaveBeenCalledWith(
        'transaction-id',
        mockUpdateTransactionDto,
      );
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      const result = await controller.deleteTransaction(
        'transaction-id',
        'user-id',
        'group-id',
      );

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionService.deleteTransaction).toHaveBeenCalledWith(
        'transaction-id',
        'user-id',
        'group-id',
      );
    });
  });
});
