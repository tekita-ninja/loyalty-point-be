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
import { RankingService } from './ranking.service';
import { CreateRankingDto, ReplaceRankingBenefitsDto, ReplaceRankingPromotionsDto, UpdateRankingDto } from './dto/ranking.dto';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';

@Controller('api/ranking')
export class RankingController {
  constructor(private rankingService: RankingService) {}

  @Get('all')
  async findAll() {
    return await this.rankingService.findAll();
  }

  @Post()
  async create(@Body() body: CreateRankingDto) {
    return await this.rankingService.create(body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.rankingService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateRankingDto) {
    return await this.rankingService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.rankingService.delete(id);
  }

  @Get()
  async search(@Query() query: QueryParamDto) {
    return await this.rankingService.search(query);
  }

  @Get(':id/promotion')
  async findManyPromotions(
    @Param('id') id: string,
    @Query() query: QueryParamDto,
  ) {
    return await this.rankingService.findManyPromotions(id, query);
  }

  @Post('assign-benefit')
  async replaceRankingBenefits(
    @Body() body: ReplaceRankingBenefitsDto
  ) {
    return await this.rankingService.replaceRankingBenefits(body);
  }

  @Post('assign-promotion')
  async replaceRankingPromotion(
    @Body() body: ReplaceRankingPromotionsDto
  ) {
    return await this.rankingService.replaceRankingPromotion(body);
  }

}
