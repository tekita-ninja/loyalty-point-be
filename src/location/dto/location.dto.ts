import { PartialType } from '@nestjs/mapped-types';
import { ArrayUnique, IsArray, IsNumber, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class ReplaceLocationRewardsDto {
  @IsString()
  locationId: string;

  @IsArray()
  @ArrayUnique()
  rewardIds: string[];
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
