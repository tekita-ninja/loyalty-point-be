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
import { BenefitService } from './benefit.service';
import { CreateBenefitDto, UpdateBenefitDto } from './dto/benefit.dto';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';

@Controller('api/benefit')
export class BenefitController {
  constructor(private benefitService: BenefitService) {}

  @Get('all')
  async findAll() {
    return await this.benefitService.findAll();
  }

  @Post()
  async create(@Body() body: CreateBenefitDto) {
    return await this.benefitService.create(body);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this.benefitService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateBenefitDto) {
    return await this.benefitService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.benefitService.delete(id);
  }

  @Get()
  async search(@Query() query: QueryParamDto) {
    return await this.benefitService.search(query);
  }
}
