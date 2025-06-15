import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { PermissionGuard } from 'src/auth/auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/customer')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('all')
  async findAll() {
    return await this.customerService.findAll();
  }

  @Get('get-profile')
  async getProfile(@Req() req: any) {
    const customerId = req.user.id;
    return await this.customerService.findProfile(customerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.customerService.findOne(id);
  }

  @Get()
  async search(@Query() query: QueryParamDto) {
    return await this.customerService.search(query);
  }
}
