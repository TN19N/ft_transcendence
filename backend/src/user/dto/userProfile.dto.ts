import { IsAlphanumeric, MaxLength } from "class-validator";

export class UserProfileDto {
    @IsAlphanumeric()
    @MaxLength(20)
    name: string
}