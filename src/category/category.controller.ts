import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { PaginationDto, QueryParamDto } from "src/common/pagination/dto/pagination.dto";

@Controller('/api/category')
export class CategoryController {
    constructor(
        private categoryService: CategoryService
    ){}

    @Post()
    async create(@Body() body: CreateCategoryDto) {
        return await this.categoryService.create(body)
    }

    @Get('all')
    async findAll() {
        return await this.categoryService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id)
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: UpdateCategoryDto
    ) {
        return this.categoryService.update(id, body);
    }

    @Delete(':id')
    async delete(
        @Param('id') id: string
    ) {
        return this.categoryService.delete(id)
    }

    @Get()
    search(@Query() query: QueryParamDto) {
        return this.categoryService.search(query);
    }

}