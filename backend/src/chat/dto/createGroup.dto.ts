import { ApiProperty } from "@nestjs/swagger";
import { GroupType } from "@prisma/client";
import { IsAlphanumeric, IsEnum, IsOptional, Length, MaxLength } from "class-validator";

export class CreateGroupDto {
    @ApiProperty({
        description: "group name",
        type: String,
        format: "alphanumeric",
        minLength: 1,
        maxLength: 20,
        example: "do3afaGroup",
    })
    @IsAlphanumeric()
    @MaxLength(20)
    name: string

    @ApiProperty({
        description: "group type",
        enum: GroupType,
        example: "PUBLIC",
    })
    @IsEnum(GroupType)
    type: GroupType

    @ApiProperty({
        description: "password for PROTECTED groups",
        type: String,
        format: "alphanumeric",
        minLength: 6,
        maxLength: 20,
        example: "mySuperStrongPassword",
    })
    @IsAlphanumeric()
    @Length(6, 20)
    @IsOptional()
    password?: string
}