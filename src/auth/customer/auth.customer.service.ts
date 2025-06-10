import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CheckNumberDto,
  CustomerLoginDto,
  CustomerRegisterDto,
  VerifyOtpDto,
} from './dto/customer.dto';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';
import { comparePassword, hashPassword } from 'src/common/password';

@Injectable()
export class AuthCustomerService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async checkPhoneNumber(data: CheckNumberDto) {
    const isRegistered = await this.prismaService.user.findUnique({
      where: { phone: data.phone },
    });

    if (isRegistered) {
      return {
        isVerified: true,
        isVerifyingOtp: false,
        isRegistered: true,
        register_token: null,
        otp_expired: null,
      };
    }

    const tempUser = await this.prismaService.tempUser.findFirst({
      where: {
        AND: [{ phone: data.phone }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (tempUser) {
      return {
        isVerified: true,
        isVerifyingOtp: false,
        isRegistered: false,
        register_token: tempUser.registerToken,
        otp_expired: null,
      };
    }

    const existingOtp = await this.prismaService.otpCode.findFirst({
      where: {
        AND: [
          { phone: data.phone },
          { expiresAt: { gt: new Date() } },
          { isVerified: false },
        ],
      },
    });

    if (existingOtp) {
      return {
        isVerified: false,
        isVerifyingOtp: true,
        isRegistered: false,
        register_token: null,
        otp_expired: existingOtp.expiresAt,
      };
    }

    const generateOtp = this.generateOtp();

    const newOtp = await this.prismaService.otpCode.create({
      data: {
        phone: data.phone,
        code: generateOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        isVerified: false,
      },
    });

    await this.sendOtpToWhatsapp(newOtp.code, data.phone);

    return {
      isVerified: false,
      isVerifyingOtp: true,
      isRegistered: false,
      register_token: null,
      otp_expired: newOtp.expiresAt,
    };
  }

  generateOtp(length = 6): string {
    let otp = '';

    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10);
    }

    return otp;
  }

  async sendOtpToWhatsapp(otp: string, target: string) {
    const clientURL = process.env.CLIENT_URL || 'https://jos.com';
    const body = {
      message: `Klik link ini untuk verifikasi nomor telepon dan melanjutkan pendaftaran akun di Elite Eight:
            
${clientURL}?code=${otp}`,
      target,
    };

    try {
      const responseWa = await axios({
        method: 'post',
        url: 'https://api.fonnte.com/send',
        headers: {
          Authorization: process.env.FONNTE_API_KEY || '8qVMEmXHCCGYbLa2occt',
        },
        data: body,
      });

      return responseWa;
    } catch (error: any) {
      throw new Error(
        'Ups, Third Party Error!! Gagal mengirim otp ke whatsapp',
      );
    }
  }

  async verifyOtp(data: VerifyOtpDto) {
    const existingOtp = await this.prismaService.otpCode.findFirst({
      where: {
        AND: [
          { phone: data.phone },
          { code: data.otp },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (!existingOtp) {
      throw new BadRequestException(
        'Kode OTP tidak valid atau sudah kedaluwarsa!',
      );
    }

    await this.prismaService.otpCode.updateMany({
      where: {
        AND: [{ phone: existingOtp.phone }, { code: existingOtp.code }],
      },
      data: { isVerified: true },
    });

    let tempUser = await this.prismaService.tempUser.findUnique({
      where: { phone: data.phone },
    });

    if (!tempUser) {
      tempUser = await this.prismaService.tempUser.create({
        data: {
          phone: data.phone,
        },
      });
    }

    const registerToken = await this.generateRegisterToken({
      sub: tempUser.id,
      phone: tempUser.phone,
    });

    tempUser = await this.prismaService.tempUser.update({
      where: { phone: tempUser.phone },
      data: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        registerToken,
      },
    });

    return {
      isVerified: true,
      isVerifyingOtp: false,
      isRegistered: false,
      register_token: tempUser.registerToken,
      otp_expired: null,
    };
  }

  async generateRegisterToken(payload: { sub: string; phone: string }) {
    return this.jwtService.sign(payload, {
      expiresIn: '24h',
    });
  }

  verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (err) {
      throw new BadRequestException('Token tidak valid!');
    }
  }

  async signUp(token: string, data: CustomerRegisterDto) {
    const payload = this.verifyToken(token);

    const tempUser = await this.prismaService.tempUser.findUnique({
      where: {
        phone: payload.phone,
      },
    });

    if (tempUser.registerToken != token) {
      throw new BadRequestException('Token Tidak valid!');
    }

    if (tempUser.expiresAt < new Date()) {
      throw new BadRequestException(
        'Token kadaluarsa, silahkan verifikasi nomor telepon kembali!',
      );
    }

    const existingEmail = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingEmail) {
      throw new BadRequestException('Email sudah pernah dipakai!');
    }

    const existingPhone = await this.prismaService.user.findUnique({
      where: { phone: tempUser.phone },
    });

    if (existingPhone) {
      throw new BadRequestException('Nomor telepon sudah terdaftar!');
    }

    let roleCustomer = await this.prismaService.role.findFirst({
      where: {
        AND: [{ name: 'Customer' }, { code: 'CUST' }],
      },
    });

    if (!roleCustomer) {
      roleCustomer = await this.prismaService.role.create({
        data: {
          name: 'Customer',
          code: 'CUST',
        },
      });
    }

    let lowestRank = await this.prismaService.ranking.findFirst({
      where: { name: 'Bronze' },
    });

    if (!lowestRank) {
      lowestRank = await this.prismaService.ranking.create({
        data: {
          name: 'Bronze',
          minPoints: 100,
          minSpendings: 100,
        },
      });
    }

    data.password = await hashPassword(data.password);

    const user = await this.prismaService.user.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        phone: tempUser.phone,
        email: data.email,
        password: data.password,
        gender: data.gender,
        birthDate: data.birthDate,
        ranking: {
          connect: {
            id: lowestRank.id,
          },
        },
      },
    });

    await this.prismaService.userRole.create({
      data: {
        userId: user.id,
        roleId: roleCustomer.id,
      },
    });

    return this.toAuthResponse(user);
  }

  async signIn(data: CustomerLoginDto) {
    const user = await this.prismaService.user.findFirst({
      where: { phone: data.phone },
    });

    if (!user || !(await comparePassword(data.password, user.password))) {
      throw new BadRequestException(
        'Nomor telepon atau password tidak sesuai!',
      );
    }

    return this.toAuthResponse(user);
  }

  async editProfile() {}

  async toAuthResponse(user: User) {
    const accessToken = await this.authService.generateAccessToken(user.id);
    const refreshToken = await this.authService.generateRefreshToken(user.id);
    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
      },
    });
    const roles = await this.prismaService.userRole.findMany({
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
    const rolePermissions = await this.prismaService.rolePermission.findMany({
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

    const permissionLists = await this.prismaService.permission.findMany({
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
}
