import { Module } from "@nestjs/common";
import { TransactionCustomerService } from "./transaction-customer.service";
import { TransactionCustomerController } from "./transaction-customer.controller";

@Module({
    controllers: [TransactionCustomerController],
    providers: [TransactionCustomerService],
})
export class TransactionCustomerModule {}