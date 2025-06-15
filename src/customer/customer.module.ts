import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [],
  // Import other modules here if needed, e.g., AuthModule, PrismaModule, etc.
})
export class CustomerModule {}
