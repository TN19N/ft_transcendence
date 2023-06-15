import { 
    Body, 
    Controller, 
    Get, 
    HttpCode, 
    HttpStatus, 
    Post, 
    Res, 
    UnauthorizedException, 
    UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Intra42Guard, JwtGuard } from './guard';
import { GetUser } from './decorator';
import { User } from '@prisma/client';
import { Response } from 'express';
import { Jwt2faGuard } from './guard/jwt2fa.guard';
import { TwoFactorAuthenticationCodeDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('login')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(Intra42Guard)
    async login(@GetUser() user: User, @Res({ passthrough: true }) response: Response) {
        response.setHeader('Set-Cookie', await this.authService.getLoginCookie(user));
    }

    @Post('2fa')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(Jwt2faGuard)
    async validateTwoFactorAuthenticationCode(@GetUser() user: User, @Body() twoFactorAuthenticationCodeDto: TwoFactorAuthenticationCodeDto, @Res({ passthrough: true }) response: Response) {
        const isValid : boolean = await this.authService.validateTwoFactorAuthenticationCode(user, twoFactorAuthenticationCodeDto.code);

        if (isValid) {
            response.setHeader('Set-Cookie', await this.authService.getLoginCookie(user, false));
        } else {
            throw new UnauthorizedException('Wrong two factor authentication code');
        }
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtGuard)
    async logout(@Res({passthrough: true}) response: Response) {
        response.clearCookie('Authentication');
    }
}