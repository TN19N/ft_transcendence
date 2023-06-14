import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class Intra42Guard extends AuthGuard('intra42') {
    constructor() {
        super();
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {                
        if (err || !user) {
            throw new UnauthorizedException('Unauthorized');
        }

        return super.handleRequest(err, user, info, context);
    }
}