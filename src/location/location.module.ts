import { forwardRef, Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { RewardService } from 'src/reward/reward.service';
import { RewardModule } from 'src/reward/reward.module';

@Module({
  imports: [forwardRef(() => RewardModule)],
  providers: [LocationService],
  controllers: [LocationController],
})
export class LocationModule {}
