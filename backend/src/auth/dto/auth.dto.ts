import { IsNotEmpty, IsStrongPassword } from "class-validator";

export class AuthDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
}