import { PartialType } from '@nestjs/mapped-types';
import {
  ArrayUnique,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRankingDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  minSpendings: number;

  @IsNumber()
  minPoints: number;

  @IsString()
  urlPicture: string;
}

export class ReplaceRankingBenefitsDto {
  @IsString()
  rankingId: string;

  @IsArray()
  @ArrayUnique()
  benefitIds: string[];
}

export class ReplaceRankingPromotionsDto {
  @IsString()
  rankingId: string;

  @IsArray()
  @ArrayUnique()
  promotionIds: string[];
}

export class UpdateRankingDto extends PartialType(CreateRankingDto) {}
