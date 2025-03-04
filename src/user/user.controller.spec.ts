import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpStatus } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user and return the created user with status 201', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const groupId = 'group-1';

      const mockUser = {
        id: 'user-1',
        ...createUserDto,
        password: 'hashedPassword',
        groupId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);

      const result = await controller.createUser(createUserDto, groupId);

      expect(result).toEqual(mockUser);
      expect(userService.createUser).toHaveBeenCalledWith(
        groupId,
        createUserDto,
      );
    });

    it('should throw an error if the user service throws an error', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const groupId = 'group-1';

      jest
        .spyOn(userService, 'createUser')
        .mockRejectedValue(new Error('User creation failed'));

      await expect(
        controller.createUser(createUserDto, groupId),
      ).rejects.toThrow('User creation failed');
      expect(userService.createUser).toHaveBeenCalledWith(
        groupId,
        createUserDto,
      );
    });
  });
});
