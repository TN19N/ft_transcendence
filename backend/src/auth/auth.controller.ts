import { Controller, Get, HttpCode, HttpStatus, Res, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Intra42Guard, JwtGuard } from './guard';
import { GetUser } from './decorator';
import { User } from '@prisma/client';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(Intra42Guard)
    async login(@GetUser() user: User, @Res() response: Response) {
        response.setHeader('Set-Cookie', await this.authService.getLoginCookie(user));
        return response.send(user);
    }

    @Get('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtGuard)
    async logout(@Res() response: Response) {
        response.clearCookie('Authentication');
        return response.sendStatus(HttpStatus.OK);
    }
}