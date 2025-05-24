import { IntersectionType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
export class PaginationDto {
  @IsOptional()
  page?: string;

  @IsOptional()
  perPage?: string;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortType?: string;

  @IsOptional()
  search?: string;
}

export class QueryParamDto extends IntersectionType(
  PaginationDto,
  class {
    [key: string]: any;
  },
) {}
