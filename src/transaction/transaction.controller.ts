import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateTransactionDto } from './dto/transaction.dto';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from 'src/auth/auth.guard';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';

@Controller('api/transaction')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(@Body() body: CreateTransactionDto) {
    return await this.transactionService.create(body);
  }

  @Get()
  async search(@Query() query: QueryParamDto) {
    return await this.transactionService.Search(query);
  }
}
