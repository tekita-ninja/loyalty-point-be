import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { LocationService } from "./location.service";
import { CreateLocationDto, UpdateLocationDto } from "./dto/location.dto";
import { QueryParamDto } from "src/common/pagination/dto/pagination.dto";

@Controller('/api/location')
export class LocationController {
    constructor(
        private locationService: LocationService
    ) {}

    @Get('all')
    async findAll() {
        return this.locationService.findAll()
    }

    @Post()
    async create(
        @Body() body: CreateLocationDto
    ) {
        return this.locationService.create(body)
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string
    ) {
        return this.locationService.findOne(id)
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: UpdateLocationDto
    ) {
        return this.locationService.update(id, body)
    }

    @Delete(':id')
    async delete(
        @Param('id') id: string
    ) {
        return this.locationService.delete(id);
    }

    @Get()
    async search(
        @Query() query: QueryParamDto
    ) {
        return this.locationService.search(query);
    }

}