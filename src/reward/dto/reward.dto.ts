import { IsNumber, IsString } from "class-validator";

export class CreateRewardDto {
    @IsString()
    name: string

    @IsString()
    urlPicture: string
    
    @IsNumber()
    price: number

    @IsString()
    categoryId: string
    

}