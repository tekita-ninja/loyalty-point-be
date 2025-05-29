import { PartialType } from "@nestjs/mapped-types"
import { IsNumber, IsString } from "class-validator"

export class CreateLocationDto {
    @IsString()
    name: string
    
    @IsString()
	address: string
    
    @IsNumber()
	latitude: number

    @IsNumber()
	longitude: number
}

export class UpdateLocationDto extends PartialType(CreateLocationDto){}