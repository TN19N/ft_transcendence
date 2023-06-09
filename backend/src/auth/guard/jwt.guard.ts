import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

export class JwtGuard extends AuthGuard('jwt') {
    constructor(
        private configService: ConfigService
    ) {
        super();
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {        
        if (err) {
            throw new UnauthorizedException('Unauthorized');
        }

        return super.handleRequest(err, user, info, context);
    }
}