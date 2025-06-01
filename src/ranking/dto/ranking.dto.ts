import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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

export class UpdateRankingDto extends PartialType(CreateRankingDto) {}
