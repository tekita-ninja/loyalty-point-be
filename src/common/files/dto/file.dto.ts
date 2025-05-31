import { IsString } from 'class-validator';

export class FileDto {
  @IsString()
  folder: string;
}

export class MoveFromTempDto {
  url: string;
}
