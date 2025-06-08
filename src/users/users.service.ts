import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { createPaginator } from 'prisma-pagination';
import { QueryParamDto } from 'src/common/pagination/dto/pagination.dto';
import { hashPassword } from 'src/common/password';
import { parseBoolean } from 'src/common/utils/parse-data-type';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserByAdminDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserByAdminDto) {
    await this.isEmailUsed(createUserDto.email);
    await this.isPhoneUsed(createUserDto.phone);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: await hashPassword(process.env.DEFAULT_PASSWORD),
      },
    });
  }

  async findMany(query: QueryParamDto) {
    const paginate = createPaginator({
      page: query.page,
      perPage: query.perPage,
    });
    const orderField = query.sortBy || 'id';
    const orderType = query.sortType || 'desc';
    const orderBy = { [orderField]: orderType };
    const result = await paginate<User, Prisma.UserFindManyArgs>(
      this.prisma.user,
      {
        where: {
          status: parseBoolean(query?.status),
          OR: query?.search
            ? [
                { firstname: { contains: query.search, mode: 'insensitive' } },
                { lastname: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
              ]
            : undefined,
        },
        orderBy,
        select: {
          id: true,
          firstname: true,
          lastname: true,
          phone: true,
          email: true,
          status: true,
          roles: {
            select: {
              id: true,
              role: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
    );

    return result;
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        status: true,
        roles: {
          select: {
            id: true,
            role: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, body: UpdateUserDto) {
    await this.checkDataById(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        firstname: body.firstname,
        lastname: body.lastname,
        gender: body.gender,
        status: body.status,
        birthDate: body.birthDate,
      },
    });
  }

  async isEmailUsed(email: string, id?: string) {
    const result = await this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    if (result && id != result.id) {
      throw new ConflictException('email has been used');
    }

    return result;
  }

  async isPhoneUsed(phone: string, id?: string) {
    const result = await this.prisma.user.findFirst({
      where: { phone },
      select: {
        id: true,
        phone: true,
      },
    });

    if (result && id !== result.id) {
      throw new ConflictException('phone has been used');
    }

    return result;
  }

  async remove(id: string) {
    await this.checkDataById(id);
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async checkDataById(id: string) {
    const r = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: { id: true },
    });
    if (!r) {
      throw new NotFoundException();
    }
    return r;
  }
  async signRole(body: { userId: string; roleIds: string[] }) {
    await this.checkDataById(body.userId);
    const userRoles = body.roleIds.map((i) => {
      return {
        userId: body.userId,
        roleId: i,
      };
    });
    return this.prisma.userRole.createMany({
      data: userRoles,
    });
  }
  async unSignRole(body: { userId: string; roleIds: string[] }) {
    await this.checkDataById(body.userId);
    const roles = body.roleIds.map((i) => {
      return i;
    });
    return this.prisma.userRole.deleteMany({
      where: {
        roleId: {
          in: roles,
        },
      },
    });
  }

  async replaceUserRole(body: { userId: string; roleIds: string[] }) {
    const user = await this.prisma.user.findUnique({
      where: { id: body.userId },
    });
    if (!user) {
      throw new BadRequestException(`userId ${body.userId} undefined!`);
    }
    const data = body.roleIds.map((item) => {
      return {
        userId: user.id,
        roleId: item,
      };
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({
        where: {
          userId: user.id,
        },
      });
      const created = await tx.userRole.createMany({
        data,
        skipDuplicates: true,
      });

      return created;
    });
  }
}
