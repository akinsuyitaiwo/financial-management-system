import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [GroupService],
  controllers: [GroupController],
  imports: [PrismaModule],
  exports: [GroupService]
})
export class GroupModule {}
