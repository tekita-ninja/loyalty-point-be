import { IsInt, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  locationId: string;

  @IsString()
  rewardId: string;

  @IsString()
  userId: string;

  @IsString()
  note: string;

  @IsInt()
  qty: number;
}
