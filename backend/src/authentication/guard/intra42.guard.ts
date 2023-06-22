import { AuthGuard } from "@nestjs/passport";

export class Intra42Guard extends AuthGuard('intra42') {}