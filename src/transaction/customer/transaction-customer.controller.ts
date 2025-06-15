import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TransactionCustomerService } from './transaction-customer.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from 'src/auth/auth.guard';
import { ConfirmTransactionCustomerDto } from './dto/transaction-customer.dto';

@Controller('/api/transaction/customer')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class TransactionCustomerController {
  constructor(
    private readonly transactionCustomerService: TransactionCustomerService,
  ) {}

  @Get()
  async getCustomerTransactions(@Req() req: any) {
    const customerId = req.user.jwtUserId;
    return await this.transactionCustomerService.getCustomerTransactions(
      customerId,
    );
  }

  @Post('confirm-transaction')
  async confirmTransaction(
    @Req() req: any,
    @Body() body: ConfirmTransactionCustomerDto,
  ) {
    const customerId = req.user.jwtUserId;
    return await this.transactionCustomerService.confirmTransaction(
      customerId,
      body,
    );
  }
}
