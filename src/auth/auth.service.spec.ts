import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EventsGateway } from '../socket/websocket.gateway';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        JwtService,
        AuthService,
        PrismaService,
        JwtStrategy,
        UserService,
        JwtService,
        EventsGateway,
                {
          provide: ConfigService, // Mock ConfigService
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return 'test-secret';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
