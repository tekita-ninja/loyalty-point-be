import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddPointDto {
  @IsString()
  userId: string;

  @IsNumber()
  price: number;

  @IsString()
  note: string;

  @IsString()
  rulePointId: string;
}

export class CustomPointDto {
  @IsString()
  userId: string;

  @IsNumber()
  point: number;

  @IsString()
  note: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  expDate: Date;
}
