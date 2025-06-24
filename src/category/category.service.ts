import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { createPaginator } from 'prisma-pagination';
import { Category, Prisma } from '@prisma/client';
import { checkDataById } from 'src/common/utils/checkDataById';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async create(data: CreateCategoryDto) {
    return await this.prismaService.category.create({
      select: {
        id: true,
        name: true,
      },
      data,
    });
  }

  async findOne(id: string) {
    await checkDataById<Category>(id, this.prismaService.category, 'category');
    return await this.prismaService.category.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async update(id: string, data: UpdateCategoryDto) {
    await checkDataById<Category>(id, this.prismaService.category, 'category');

    return await this.prismaService.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await checkDataById<Category>(id, this.prismaService.category, 'category');

    return await this.prismaService.category.delete({
      where: { id },
    });
  }

  async search(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });
    const orderField = query.sortBy || 'id';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };
    return await paginate<Category, Prisma.CategoryFindManyArgs>(
      this.prismaService.category,
      {
        where: {
          OR: query?.search
            ? [{ name: { contains: query.search, mode: 'insensitive' } }]
            : undefined,
        },
        orderBy,
        select: {
          id: true,
          name: true,
        },
      },
    );
  }
}
