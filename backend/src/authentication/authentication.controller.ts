import { 
    Body, 
    Controller, 
    Get, 
    HttpCode, 
    HttpStatus, 
    Post, 
    Req, 
    UnauthorizedException, 
    UseGuards
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Intra42Guard, JwtGuard } from './guard';
import { GetUser } from './decorator';
import { User } from '@prisma/client';
import { Request } from 'express';
import { Jwt2faGuard } from './guard/jwt2fa.guard';
import { TwoFactorAuthenticationCodeDto } from './dto';

@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}

    @Get('login')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(Intra42Guard)
    async login(@GetUser() user: User, @Req() request: Request) {
        request.res!.setHeader('Set-Cookie', await this.authenticationService.getLoginCookie(user));
    }

    @Post('2fa')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(Jwt2faGuard)
    async validateTwoFactorAuthenticationCode(@GetUser() user: User, @Body() twoFactorAuthenticationCodeDto: TwoFactorAuthenticationCodeDto, @Req() request: Request) {
        const isValid : boolean = await this.authenticationService.validateTwoFactorAuthenticationCode(user, twoFactorAuthenticationCodeDto.code);

        if (isValid) {
            request.res!.setHeader('Set-Cookie', await this.authenticationService.getLoginCookie(user, false));
        } else {
            throw new UnauthorizedException('Wrong two factor authentication code');
        }
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtGuard)
    async logout(@Req() request: Request) {
        request.res!.clearCookie('Authentication');
    }
}