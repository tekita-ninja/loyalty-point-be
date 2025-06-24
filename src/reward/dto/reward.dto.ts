import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDate,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateRewardDto {
  @IsString()
  name: string;

  @IsString()
  urlPicture: string;

  @IsNumber()
  price: number;

  @IsString()
  categoryId: string;

  @IsNumber()
  stocks: number;

  @IsNumber()
  isLimited: number;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class ReplaceRewardLocationsDto {
  @IsString()
  rewardId: string;

  @IsArray()
  @ArrayUnique()
  locationIds: string[];
}

export class UpdateRewardDto extends PartialType(CreateRewardDto) {}
