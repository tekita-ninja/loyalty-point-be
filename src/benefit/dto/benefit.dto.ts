import { PartialType } from '@nestjs/mapped-types';
import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class CreateBenefitDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class ReplaceBenefitRankingsDto {
  @IsString()
  benefitId: string;

  @IsArray()
  @ArrayUnique()
  rankingIds: string[];
}

export class UpdateBenefitDto extends PartialType(CreateBenefitDto) {}
