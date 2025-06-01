import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

export class CreateBenefitDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class UpdateBenefitDto extends PartialType(CreateBenefitDto) {}
