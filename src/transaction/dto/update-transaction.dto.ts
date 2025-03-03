/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTransactionDto {
    @IsOptional()
    @IsNumber()
    amount?: number;
    
    @IsOptional()
    @IsString()
    description?: string;
    
    @IsOptional()
    @IsString()
    type?: 'income' | 'expense';

    @IsOptional()
    @IsDateString()
    date?: string;
  
  @IsUUID()
  userId: string; 
}
