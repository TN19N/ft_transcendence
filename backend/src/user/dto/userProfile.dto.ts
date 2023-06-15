import { IsAlphanumeric, IsNotEmpty } from "class-validator";

export class UserProfileDto {
    @IsAlphanumeric()
    name: string
}