import { Controller, Post } from "@nestjs/common";
import { AuthCustomerService } from "./auth.customer.service";
import { CustomerLoginDto } from "./dto/customer.dto";

@Controller('api/auth/customer')
export class AuthCustomerController {
    constructor(
        private authCustomerService: AuthCustomerService
    ) {}

    @Post()
    async loginCustomer(body: CustomerLoginDto) {

    }
    
}