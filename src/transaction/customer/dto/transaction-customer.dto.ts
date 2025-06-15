import { IsString } from 'class-validator';

export class ConfirmTransactionCustomerDto {
  @IsString()
  transactionId: string;

  @IsString()
  password: string;
}
