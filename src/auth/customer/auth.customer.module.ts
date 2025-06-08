import { Module } from '@nestjs/common';
import { AuthCustomerService } from './auth.customer.service';
import { AuthCustomerController } from './auth.customer.controller';
import { AuthModule } from '../auth.module';

@Module({
  controllers: [AuthCustomerController],
  providers: [AuthCustomerService],
  imports: [AuthModule],
})
export class AuthCustomerModule {}
