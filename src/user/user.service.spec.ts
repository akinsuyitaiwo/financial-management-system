import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock bcrypt.hash
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
      return Promise.resolve('hashedPassword');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const groupId = 'group-1';

      const mockUser: User = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        groupId: 'group-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null); // No existing user
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);

      const result = await service.createUser(groupId, createUserDto);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: 'hashedPassword',
          groupId,
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const groupId = 'group-1';

      const mockExistingUser: User = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        groupId: 'group-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockExistingUser);

      await expect(service.createUser(groupId, createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should return a user if found', async () => {
      const userId = 'user-1';
      const mockUser: User = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        groupId: 'group-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.findUserById(userId);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null if user is not found', async () => {
      const userId = 'user-1';

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findUserById(userId);

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
