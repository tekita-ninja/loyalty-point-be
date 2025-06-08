import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  title: string;

  @IsString()
  urlPicture: string;

  @IsString()
  subtitle: string;

  @IsString()
  description: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsNumber()
  isPush: number;
}

export class ReplacePromotionRankingsDto {
  @IsString()
  promotionId: string;

  @IsArray()
  @ArrayUnique()
  rankingIds: string[];
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}
