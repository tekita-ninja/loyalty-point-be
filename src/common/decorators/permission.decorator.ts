// permission.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const AUTO_PERMISSION_KEY = 'auto_permission';
export const Permission = () => SetMetadata(AUTO_PERMISSION_KEY, true);
