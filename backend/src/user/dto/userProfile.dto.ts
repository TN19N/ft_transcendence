import { ApiProperty } from "@nestjs/swagger";
import { IsAlphanumeric, MaxLength } from "class-validator";

export class UserProfileDto {
    @ApiProperty({
        description: "The user's name",
        type: String,
        format: 'alphanumeric',
        minLength: 1,
        maxLength: 20,
        example: 'pingPong7',
    })
    @IsAlphanumeric()
    @MaxLength(20)
    name: string
}