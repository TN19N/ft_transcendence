import { IsDecimal, IsString, Length } from "class-validator";

export class TwoFaDto {
    @IsString()
    @IsDecimal()
    @Length(6, 6)
    twoFaCode: string;
}