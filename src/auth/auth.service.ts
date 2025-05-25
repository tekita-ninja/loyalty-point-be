import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload, SignInDto, SignUpDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { comparePassword, hashPassword } from 'src/common/password';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private jwt: JwtService,
  ) {}
  async signin(dto: SignInDto) {
    const user = await this.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('invalid credentials!');
    }
    const isValid = await comparePassword(dto.password, user.password);
    if (!isValid) {
      throw new BadRequestException('invalid credentials!');
    }

    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
      },
    });
    const roles = await this.prisma.userRole.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
    // permission user logged in
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId: {
          in: roles.map((i) => i.role.id),
        },
      },
    });
    // GET UNIQUE PERMISSIONS
    const uniquePermissions = [
      ...new Set(rolePermissions.map((i) => i.permissionId)),
    ];

    const permissionLists = await this.prisma.permission.findMany({
      where: {
        id: {
          in: uniquePermissions,
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        method: true,
      },
    });
    const permissions = permissionLists.map((item) => {
      return `${item.name}`;
    });
    return {
      user: {
        id: user.id,
        phone: user.phone,
        firstname: user.firstname,
        lastname: user.lastname,
        roles: roles.map((i) => i.role.name),
      },
      accessToken,
      refreshToken,
      roles: roles.map((i) => i.role.name),
      permissions: permissions,
    };
  }
  async signup(dto: SignUpDto) {
    const isEmailRegistered = await this.isEmailUsed(dto.email);
    if (isEmailRegistered) {
      throw new BadRequestException('Email has been used!');
    }
    dto.password = await hashPassword(dto.password);
    return this.prisma.user.create({
      data: dto,
    });
  }
  async signout(req: Request) {
    const authorization = req.headers.authorization;
    const token = authorization.split(' ').pop();
    const decodeToken = await this.decodeToken(token);
    await this.prisma.user.update({
      where: { id: decodeToken.userId },
      data: {
        refreshToken: null,
      },
    });

    return true;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }
  async isEmailUsed(email: string) {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count;
  }
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new ForbiddenException('invalid refresh token');
    }
    const valid = this.verifyRefreshToken(refreshToken);
    if (!valid) {
      throw new UnauthorizedException('user logged out, please login');
    }
    const decodedUser = await this.decodeToken(refreshToken);
    if (!decodedUser) {
      throw new ForbiddenException('invalid refresh token');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: decodedUser.userId,
        refreshToken,
      },
    });
    if (!user) {
      throw new ForbiddenException('invalid refresh token');
    }
    const accessToken = await this.generateAccessToken(user.id);
    return {
      accessToken,
      refreshToken,
    };
  }

  // Fungsi untuk validasi pengguna (misal: cek password)
  async findUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstname: true,
        lastname: true,
      },
    });
    if (!user) {
      return null;
    }
    return user;
  }
  // Generate JWT Token
  async generateAccessToken(userId: string) {
    const payload: JwtPayload = { userId };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d', // Token expires in 1 hour
    });
  }
  // Generate Refresh Token
  async generateRefreshToken(userId: string) {
    const payload: JwtPayload = { userId };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d', // Refresh token expires in 7 days
    });
  }

  // Verify Refresh Token
  async verifyRefreshToken(refreshToken: string) {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (e) {
      return null;
    }
  }
  async decodeToken(token: string) {
    return this.jwt.decode(token);
  }
}
