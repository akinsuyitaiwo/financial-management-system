import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  providers: [TransactionService],
  controllers: [TransactionController],
  imports: [PrismaModule, SocketModule],
  exports: [TransactionService]
})
export class TransactionModule {}
