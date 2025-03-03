/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateTransactionDto {

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  description: string;
  
  @IsNotEmpty()
  @IsString()
  category: 'income' | 'expense';

   @IsDateString()
  date: string;
  
  @IsUUID()
  userId: string; 
}
