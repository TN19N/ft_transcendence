import { IsDecimal, Length } from "class-validator";

export class TwoFactorAuthenticationCodeDto {
    @IsDecimal()
    @Length(6, 6)
    code: string;
}