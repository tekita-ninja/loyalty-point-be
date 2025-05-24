import { PartialType } from '@nestjs/mapped-types';
import { CreateSidemenuDto } from './create-sidemenu.dto';

export class UpdateSidemenuDto extends PartialType(CreateSidemenuDto) {}
