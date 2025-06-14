import { Body, Controller, Delete, Get, Param, Post, Put, Query, Search } from "@nestjs/common";
import { CreateRulePointDto, UpdateRulePointDto } from "./dto/rule-point.dto";
import { RulePointService } from "./rule-point.service";
import { QueryParamDto } from "src/common/pagination/dto/pagination.dto";

@Controller('/api/rule-point')
export class RulePointController {
    constructor(
        private rulePointService: RulePointService
    ) {}

    @Get('all')
    async findAll() {
        return await this.rulePointService.findAll()
    }

    @Post()
    async create(
        @Body() body: CreateRulePointDto) {
        return await this.rulePointService.create(body);
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string
    ) {
        return await this.rulePointService.findOne(id)
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: UpdateRulePointDto
    ) {
        return await this.rulePointService.update(id, body)
    }

    @Delete(':id')
    async delete(
        @Param('id') id: string
    ) {
        return await this.rulePointService.delete(id)
    }

    @Get()
    async search(
        @Query() query: QueryParamDto
    ){
        return await this.rulePointService.search(query)
    }

}