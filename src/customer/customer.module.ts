import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { PointModule } from 'src/point/point.module';

@Module({
  imports: [PointModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [],
  // Import other modules here if needed, e.g., AuthModule, PrismaModule, etc.
})
export class CustomerModule {}
