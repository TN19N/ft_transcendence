import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UnauthorizedException, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Intra42Guard, JwtGuard } from './guard';
import { GetUser } from './decorator';
import { User } from '@prisma/client';
import { Response } from 'express';
import { Jwt2faGuard } from './guard/jwt2fa.guard';
import { TwoFaDto } from './dto';
import { authenticator } from 'otplib';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('login')
    @UseGuards(Intra42Guard)
    async login(@GetUser() user: User, @Res() response: Response) {
        response.setHeader('Set-Cookie', await this.authService.getLoginCookie(user, user.isTwoFactorAuthenticationEnabled));
        user.twoFactorAuthenticationSecret = null;
        return response.send(user);
    }

    @Post('2fa')
    @UseGuards(Jwt2faGuard)
    async validate2fa(@GetUser() user: User, @Body() twoFa: TwoFaDto, @Res() response: Response) {
        const isValid : boolean = authenticator.verify({
            token: twoFa.twoFaCode,
            secret: user.twoFactorAuthenticationSecret!,
        });

        if (isValid) {
            response.setHeader('Set-Cookie', await this.authService.getLoginCookie(user, false));
            response.sendStatus(HttpStatus.OK)
        } else {
            throw new UnauthorizedException('Wrong 2fa code!');
        }
    }

    @Post('logout')
    @UseGuards(JwtGuard)
    async logout(@Res() response: Response) {
        response.clearCookie('Authentication');
        response.sendStatus(HttpStatus.OK);
    }
}