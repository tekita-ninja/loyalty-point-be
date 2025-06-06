import { Module } from "@nestjs/common";
import { AuthCustomerService } from "./auth.customer.service";
import { AuthCustomerController } from "./auth.customer.controller";

@Module({
    controllers: [AuthCustomerController],
    providers: [AuthCustomerService]
})
export class AuthCustomerModule {}