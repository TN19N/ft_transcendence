import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return ctx
        .switchToHttp()
        .getRequest()
        .user;
})