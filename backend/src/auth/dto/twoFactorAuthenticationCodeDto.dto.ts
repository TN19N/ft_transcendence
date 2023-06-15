import { IsDecimal, IsString, Length } from "class-validator";

export class TwoFactorAuthenticationCodeDto {
    @IsString()
    @IsDecimal()
    @Length(6, 6)
    code: string;
}