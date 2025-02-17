import { IsString, IsOptional, Length } from "class-validator";

export class CreateResourceDto {
    @IsString()
    @Length(3, 100)
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;
}


export class UpdateResourceDto {
    @IsOptional()
    @IsString()
    @Length(3, 100)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
