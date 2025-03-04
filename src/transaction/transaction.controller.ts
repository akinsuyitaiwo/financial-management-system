import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('transaction')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  @Post()
  async createTransaction(
    @Req() req,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const userId = req.user.id;
    return this.transactionService.createTransaction(
      userId,
      createTransactionDto,
    );
  }

  @Get()
  findAll() {
    return this.transactionService.getAllTransactions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.getTransactionById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionService.updateTransaction(id, updateTransactionDto);
  }

  @Delete(':id')
  async deleteTransaction(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('groupId') groupId: string,
  ) {
    return this.transactionService.deleteTransaction(id, userId, groupId);
  }
}
