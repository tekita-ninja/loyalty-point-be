import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException("Token not in Bearer format!"); // atau throw error jika wajib
    }

    return authHeader.split(' ')[1]; // hasil: hanya token-nya
  },
);
