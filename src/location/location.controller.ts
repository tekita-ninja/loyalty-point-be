import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocationService } from './location.service';
import {
  CreateLocationDto,
  ReplaceLocationRewardsDto,
  UpdateLocationDto,
} from './dto/location.dto';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('/api/location')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get('all')
  async findAll() {
    return await this.locationService.findAll();
  }

  @Post()
  async create(@Body() body: CreateLocationDto) {
    return await this.locationService.create(body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.locationService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateLocationDto) {
    return await this.locationService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.locationService.delete(id);
  }

  @Get()
  async search(@Query() query: QueryParamDto) {
    return await this.locationService.search(query);
  }

  @Post('assign-reward')
  async assignReward(@Body() body: ReplaceLocationRewardsDto) {
    return await this.locationService.replaceLocationRewards(body);
  }

  @Get('/:locationId/reward')
  async findManyRewards(
    @Param('locationId') locationId: string,
    @Query() query: QueryParamDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return await this.locationService.findManyRewards(
      userId,
      locationId,
      query,
    );
  }
}
