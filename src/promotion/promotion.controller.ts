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
import { PromotionService } from './promotion.service';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';

@Controller('api/promotion')
export class PromotionController {
  constructor(private promotionService: PromotionService) {}

  @Get('all')
  async findAll() {
    return await this.promotionService.findAll();
  }

  @Post()
  async create(@Body() body: CreatePromotionDto) {
    return await this.promotionService.create(body);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.promotionService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePromotionDto) {
    return await this.promotionService.update(id, body);
  }

  @Delete(':id')
  async delte(@Param('id') id: string) {
    return await this.promotionService.delete(id);
  }

  @Get()
  async search(@Query() query: QueryParamDto) {
    return await this.promotionService.search(query);
  }
}
