import { Module } from "@nestjs/common";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";
import { TransactionCustomerModule } from "./customer/transaction-customer.module";

@Module({
    imports: [TransactionCustomerModule],
    controllers: [TransactionController],
    providers: [TransactionService],

})
export class TransactionModule {}