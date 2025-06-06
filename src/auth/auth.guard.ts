import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
// import { AUTO_PERMISSION_KEY } from 'src/common/decorators/permission.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method.toUpperCase();

    let path = request.route?.path || request.url;
    path = path.replace(/^\/v1\//, '/').replace(/^\//, '').replace('api/', '');
    const permissionCode = `${method}_${path}`;
    // GET ROLE USER;
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
    // const isSuper = userRoles.map((i) => i.role.code).includes('SUPER');
    // if (isSuper) {
    //   return true;
    // }

    const userPermissions = userRoles
      .flatMap((ur) => ur.role.permissions)
      .map((rp) => rp.permission.code);
    // ,
    
    return true;
  }
}
