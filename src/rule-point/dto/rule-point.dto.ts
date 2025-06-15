import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsNumber } from 'class-validator';
import { CreateRewardDto } from 'src/reward/dto/reward.dto';

export class CreateRulePointDto {
  @IsIn([0, 1], { message: 'Value must be 0 or 1' })
  isActive: number;

  @IsNumber()
  multiplier: number;
}

export class UpdateRulePointDto extends PartialType(CreateRewardDto) {}
