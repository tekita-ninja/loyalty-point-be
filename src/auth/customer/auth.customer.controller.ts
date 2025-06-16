import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthCustomerService } from './auth.customer.service';
import {
  CheckNumberDto,
  CustomerChangePinDto,
  CustomerLoginDto,
  CustomerRegisterDto,
  VerifyOtpDto,
} from './dto/customer.dto';
import { GetToken } from 'src/common/decorators/get-token.decorator';
import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from '../auth.guard';

@Controller('api/auth/customer')
export class AuthCustomerController {
  constructor(private authCustomerService: AuthCustomerService) {}

  @Post('check-phone')
  async checkPhoneNumber(@Body() body: CheckNumberDto) {
    return await this.authCustomerService.checkPhoneNumber(body);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authCustomerService.verifyOtp(body);
  }

  @Post('register')
  async signUp(@GetToken() token: string, @Body() body: CustomerRegisterDto) {
    return this.authCustomerService.signUp(token, body);
  }

  @Post('login')
  async signIn(@Body() body: CustomerLoginDto) {
    return this.authCustomerService.signIn(body);
  }


  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Post('change-pin') 
  async changePin(
    @Body() body: CustomerChangePinDto,
    @Req() req: any,
  ) {
    const customerId = req.user.id 
    return this.authCustomerService.changePin(customerId, body)
  }
}
