import { Module } from '@nestjs/common';
import { TransactionLogService } from './transaction-log.service';
import { TransactionLogController } from './transaction-log.controller';

@Module({
  controllers: [TransactionLogController],
  providers: [TransactionLogService],
})
export class TransactionLogModule {}
