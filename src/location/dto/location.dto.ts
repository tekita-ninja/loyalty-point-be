import { PartialType } from '@nestjs/mapped-types';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsNumber,
  IsString,
} from 'class-validator';

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

export class AssignRewardDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  rewardIds: string[];

  @IsString()
  locationId: string;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
