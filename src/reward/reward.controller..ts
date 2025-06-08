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
import {
  CreateRewardDto,
  ReplaceRewardLocationsDto,
  UpdateRewardDto,
} from './dto/reward.dto';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';

@Controller('api/reward')
export class RewardController {
  constructor(private rewardService: RewardService) {}

  @Post()
  async create(@Body() body: CreateRewardDto) {
    return await this.rewardService.create(body);
  }

  @Get('all')
  async findAll() {
    return await this.rewardService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.rewardService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateRewardDto) {
    return await this.rewardService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.rewardService.delete(id);
  }

  @Get()
  async search(@Query() query: QueryParamDto) {
    return await this.rewardService.search(query);
  }

  @Post('assign-location')
  async assignLocation(@Body() body: ReplaceRewardLocationsDto) {
    return await this.rewardService.replaceRewardLocations(body);
  }
}
