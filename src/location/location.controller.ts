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
import { LocationService } from './location.service';
import {
  AssignRewardDto,
  CreateLocationDto,
  UpdateLocationDto,
} from './dto/location.dto';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';

@Controller('/api/location')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get('all')
  findAll() {
    return this.locationService.findAll();
  }

  @Post()
  create(@Body() body: CreateLocationDto) {
    return this.locationService.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateLocationDto) {
    return this.locationService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.locationService.delete(id);
  }

  @Get()
  search(@Query() query: QueryParamDto) {
    return this.locationService.search(query);
  }

  @Post('assign-reward')
  assignReward(@Body() body: AssignRewardDto) {
    return this.locationService.assignRewards(body);
  }

  @Get('/:locationId/reward')
  findManyRewards(
    @Param('locationId') locationId: string,
    @Query() query: QueryParamDto,
  ) {
    return this.locationService.findManyRewards(locationId, query);
  }
}
