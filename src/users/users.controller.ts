import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from 'src/auth/auth.guard';
import { PaginationDto } from 'src/common/pagination/dto/pagination.dto';
import { CreateUserByAdminDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserByAdminDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findMany(@Query() query: PaginationDto) {
    return this.usersService.findMany(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
  @Post('sign-roles')
  async signRole(@Body() body: { userId: string; roleIds: string[] }) {
    return this.usersService.signRole(body);
  }
  @Post('unsign-roles')
  async unSignRole(@Body() body: { userId: string; roleIds: string[] }) {
    return this.usersService.unSignRole(body);
  }
  @Post('set-role')
  replaceRoleMenu(@Body() body: { userId: string; roleIds: string[] }) {
    return this.usersService.replaceUserRole(body);
  }
}
