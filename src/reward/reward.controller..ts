import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RewardService } from './reward.service';
import { CreateRewardDto, UpdateRewardDto } from './dto/reward.dto';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';

@Controller('api/reward')
export class RewardController {
  constructor(private rewardService: RewardService) {}

  @Post()
  create(@Body() body: CreateRewardDto) {
    return this.rewardService.create(body);
  }

  @Get('all')
  findAll() {
    return this.rewardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rewardService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateRewardDto) {
    return this.rewardService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.rewardService.delete(id);
  }

  @Get()
  search(@Query() query: QueryParamDto) {
    return this.rewardService.search(query);
  }
}
