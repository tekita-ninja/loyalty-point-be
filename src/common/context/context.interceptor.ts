import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { asyncLocalStorage } from './async-context';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    // Ambil user ID dari req.user (pastikan pakai JwtAuthGuard)
    const userId: string | undefined = req.user?.id;

    return asyncLocalStorage.run({ userId }, () => {
      return next.handle();
    });
  }
}
