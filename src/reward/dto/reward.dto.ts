import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsString } from 'class-validator';

export class CreateRewardDto {
  @IsString()
  name: string;

  @IsString()
  urlPicture: string;

  @IsNumber()
  price: number;

  @IsString()
  category_id: string;
}

export class UpdateRewardDto extends PartialType(CreateRewardDto) {}
