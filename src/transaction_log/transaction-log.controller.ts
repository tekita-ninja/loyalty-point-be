import { Controller, Get, Query } from '@nestjs/common';
import { TransactionLogService } from './transaction-log.service';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';

@Controller('/api/transaction-log')
export class TransactionLogController {
  constructor(private transactionLogsService: TransactionLogService) {}

  @Get()
  async search(@Query() query: QueryParamDto) {
    return await this.transactionLogsService.search(query);
  }
}
