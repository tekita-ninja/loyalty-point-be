import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRolePermissionDto } from './dto/create-role_permission.dto';

@Injectable()
export class RolePermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.rolePermission.findMany({
      select: {
        permission: {
          select: {
            id: true,
            name: true,
            code: true,
            method: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }
  // async signRolePermission(dto: CreateRolePermissionDto) {
  //   const role = await this.prisma.role.findUnique({
  //     where: { id: dto.roleId },
  //   });
  //   const permissions = await this.prisma.permission.findMany({
  //     where: {
  //       id: {
  //         in: dto.permissionIds,
  //       },
  //     },
  //   });
  //   if (!role) {
  //     throw new BadRequestException('role is undefined');
  //   }

  //   if (permissions.length !== dto.permissionIds.length) {
  //     throw new BadRequestException('any permission is undefined');
  //   }
  //   return this.prisma.$transaction(async (tx) => {
  //     await tx.rolePermission.deleteMany({
  //       where: {
  //         roleId: role.id,
  //       },
  //     });
  //     const data = dto.permissionIds.map((item) => {
  //       return {
  //         roleId: role.id,
  //         permissionId: item,
  //       };
  //     });
  //     const created = await this.prisma.rolePermission.createMany({
  //       data: data,
  //       skipDuplicates: true,
  //     });
  //     return created;
  //   });
  // }
  async signRolePermission(dto: CreateRolePermissionDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new BadRequestException('role is undefined');
    }

    // Validasi di luar transaksi
    const validPermissions = await this.prisma.permission.findMany({
      where: { id: { in: dto.permissionIds } },
      select: { id: true },
    });

    const validIds = new Set(validPermissions.map((p) => p.id));
    const invalidIds = dto.permissionIds.filter((id) => !validIds.has(id));

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid permission IDs: ${invalidIds.join(', ')}`,
      );
    }

    // Persiapkan data insert di luar transaksi
    const data = dto.permissionIds.map((id) => ({
      roleId: role.id,
      permissionId: id,
    }));

    // Jalankan transaksi ringan
    return await this.prisma.$transaction(
      async (tx) => {
        await tx.rolePermission.deleteMany({
          where: { roleId: role.id },
        });

        const created = await tx.rolePermission.createMany({
          data,
          skipDuplicates: true,
        });

        return created;
      },
      {
        timeout: 10_000,
      },
    );
  }
}
