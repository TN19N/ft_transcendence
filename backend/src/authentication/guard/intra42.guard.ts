import { UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class Intra42Guard extends AuthGuard('intra42') {
    handleRequest(err: any, user: any, info: any, context: any) {
        if (err || !user) {
            throw new UnauthorizedException("unauthorized");
        }

        return super.handleRequest(err, user, info, context);
    }
}