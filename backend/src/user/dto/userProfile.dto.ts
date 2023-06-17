import { IsAlphanumeric } from "class-validator";

export class UserProfileDto {
    @IsAlphanumeric()
    name: string
}