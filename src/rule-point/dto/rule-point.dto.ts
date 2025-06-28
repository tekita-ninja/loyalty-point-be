import { Optional } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsNumber, IsString } from 'class-validator';

export class CreateRulePointDto {
  @IsIn([0, 1], { message: 'Value must be 0 or 1' })
  isActive: number;

  @IsNumber()
  multiplier: number;

  @IsString()
  name: string;

  @Optional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Optional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

export class UpdateRulePointDto extends PartialType(CreateRulePointDto) { }
