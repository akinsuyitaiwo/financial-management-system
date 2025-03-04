import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GroupService', () => {
  let service: GroupService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService, PrismaService],
    }).compile();

    service = module.get<GroupService>(GroupService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
