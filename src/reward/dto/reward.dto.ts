import { PartialType } from '@nestjs/mapped-types';
import { ArrayUnique, IsArray, IsNumber, IsString } from 'class-validator';

export class CreateRewardDto {
  @IsString()
  name: string;

  @IsString()
  urlPicture: string;

  @IsNumber()
  price: number;

  @IsString()
  categoryId: string;
}

export class ReplaceRewardLocationsDto {
  @IsString()
  rewardId: string;

  @IsArray()
  @ArrayUnique()
  locationIds: string[];
}

export class UpdateRewardDto extends PartialType(CreateRewardDto) {}
