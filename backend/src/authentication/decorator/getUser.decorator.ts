import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const GetUserId = createParamDecorator((_: unknown, ctx: ExecutionContext) : string => {
    return ctx
        .switchToHttp()
        .getRequest()
        .user
        .id;
})