import { Module } from '@nestjs/common';
import { RulePointService } from './rule-point.service';
import { RulePointController } from './rule-point.controller';

@Module({
  providers: [RulePointService],
  controllers: [RulePointController],
})
export class RulePointModule {}
