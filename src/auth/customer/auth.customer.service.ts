import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CheckNumberDto,
  CustomerChangePinDto,
  CustomerLoginDto,
  CustomerRegisterDto,
  VerifyOtpDto,
} from './dto/customer.dto';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { comparePassword, hashPassword } from 'src/common/password';
import { transformUrlPicture } from 'src/common/utils/transform-picture.utils';

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
        expiresAt: new Date(Date.now() + 1 * 20 * 1000),
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
      message: `Klik link ini untuk verifikasi nomor telepon atau masukkan kode verifikasi untuk melanjutkan pendaftaran akun di Elite Eight:

Link Verifikasi: ${clientURL}/verify-top?code=${otp} 

Kode verifikasi: ${otp}
`,
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
        AND: [{ name: 'CUSTOMER' }, { code: 'CUST' }],
      },
    });

    if (!roleCustomer) {
      roleCustomer = await this.prismaService.role.create({
        data: {
          name: 'CUSTOMER',
          code: 'CUST',
        },
      });
    }

    let lowestRank = await this.prismaService.ranking.findFirst({
      where: { name: 'Silver' },
    });

    if (!lowestRank) {
      lowestRank = await this.prismaService.ranking.create({
        data: {
          name: 'Silver',
          minPoints: 20000,
          minSpendings: 2000000,
        },
      });
    }

    data.password = await hashPassword(data.password);

    const newUser = await this.prismaService.user.create({
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
        userId: newUser.id,
        roleId: roleCustomer.id,
      },
    });

    const user = await this.prismaService.user.findFirst({
      where: { phone: newUser.phone },
      select: {
        id: true,
        phone: true,
        firstname: true,
        lastname: true,
        password: true,
        ranking: {
          select: {
            id: true,
            name: true,
            minPoints: true,
            minSpendings: true,
            rulePoint: {
              select: {
                id: true,
                multiplier: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
            promotions: {
              where: {
                promotion: {
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                  isPush: 1,
                },
              },
              select: {
                promotion: {
                  select: {
                    id: true,
                    title: true,
                    subtitle: true,
                    description: true,
                    urlPicture: true,
                    startDate: true,
                    endDate: true,
                    isPush: true,
                  },
                },
              },
            },
          },
        },
        customerPoints: {
          where: {
            AND: [{ isCancel: 0 }, { isExpired: 0 }],
          },
          select: {
            id: true,
            transactionId: true,
            rulePointId: true,
            point: true,
            price: true,
            type: true,
            isCancel: true,
            isExpired: true,
          },
        },
      },
    });

    return this.toAuthResponse(user);
  }

  async signIn(data: CustomerLoginDto) {
    const user = await this.prismaService.user.findFirst({
      where: { phone: data.phone },
      select: {
        id: true,
        phone: true,
        firstname: true,
        lastname: true,
        password: true,
        ranking: {
          select: {
            id: true,
            name: true,
            minPoints: true,
            minSpendings: true,
            rulePoint: {
              select: {
                id: true,
                multiplier: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
            promotions: {
              where: {
                promotion: {
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                  isPush: 1,
                },
              },
              select: {
                promotion: {
                  select: {
                    id: true,
                    title: true,
                    subtitle: true,
                    description: true,
                    urlPicture: true,
                    startDate: true,
                    endDate: true,
                    isPush: true,
                  },
                },
              },
            },
          },
        },
        customerPoints: {
          where: {
            AND: [{ isCancel: 0 }, { isExpired: 0 }],
          },
          select: {
            id: true,
            transactionId: true,
            rulePointId: true,
            point: true,
            price: true,
            type: true,
            isCancel: true,
            isExpired: true,
          },
        },
      },
    });

    if (!user || !(await comparePassword(data.password, user.password))) {
      throw new BadRequestException(
        'Nomor telepon atau password tidak sesuai!',
      );
    }

    return this.toAuthResponse(user);
  }

  async toAuthResponse(user: any) {
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

    const result = {
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
      ranking: user.ranking,
      customerPoints: user.customerPoints,
    };

    const resultWithTotalPoint = {
      ...result,
      totalPoint:
        result.customerPoints?.reduce((sum, cp) => sum + cp.point, 0) || 0,
    };

    const transformedResult = {
      ...resultWithTotalPoint,
      ranking: resultWithTotalPoint.ranking
        ? {
            ...resultWithTotalPoint.ranking,
            promotions: resultWithTotalPoint.ranking.promotions.map((promo) =>
              transformUrlPicture(promo.promotion),
            ),
          }
        : null,
    };

    return transformedResult;
  }

  async changePin(customerId: string, data: CustomerChangePinDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: customerId },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan!');
    }

    const isValidOldPassword = await comparePassword(
      data.oldPassword,
      user.password,
    );

    if (!isValidOldPassword) {
      throw new BadRequestException('PIN lama anda tidak cocok!');
    }

    if (data.oldPassword === data.newPassword) {
      throw new BadRequestException(
        'PIN baru tidak boleh sama dengan PIN lama!',
      );
    }

    if (data.newPassword !== data.confirmationNewPassword) {
      throw new BadRequestException(
        'PIN baru dan konfirmasi PIN baru tidak cocok!',
      );
    }

    user.password = await hashPassword(data.newPassword);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { password: user.password },
    });

    return { message: 'PIN berhasil diubah!' };
  }
}
