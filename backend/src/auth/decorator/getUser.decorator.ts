import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { User } from "@prisma/client";

export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) : User => {
    return ctx
        .switchToHttp()
        .getRequest()
        .user;
})