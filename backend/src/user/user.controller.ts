import { 
    Body, 
    Controller, 
    Get, 
    HttpCode, 
    HttpStatus,
    Post, 
    Res, 
    UnauthorizedException, 
    UseGuards, 
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { TwoFactorAuthenticationCodeDto } from 'src/auth/dto';
import { Response } from 'express';
import { AuthService } from './../auth/auth.service';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
    constructor(
        private userService: UserService,
        private authService: AuthService,
    ) {}

    // this is for testing purpose
    @Post('delete')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete() {
        await this.userService.deleteAll();
    }

    @Get('avatar')
    @HttpCode(HttpStatus.OK)
    async download(@GetUser() user: User, @Res() response: Response) {
        response.download(`${__dirname}/../../upload/${user.id}.png`);
    }

    @Post('turnOn2fa')
    @HttpCode(HttpStatus.CREATED)
    async turnOnTwoFactorAuthentication(@GetUser() user: User) {
        return await this.userService.turnOnTwoFactorAuthentication(user);
    }

    @Post('turnOff2fa')
    @HttpCode(HttpStatus.CREATED)
    async turnOffTwoFactorAuthentication(@GetUser() user: User) {
        await this.userService.turnOffTwoFactorAuthentication(user);
    }

    @Post('enable2fa')
    @HttpCode(HttpStatus.CREATED)
    async enable2FA(@GetUser() user: User, @Body() twoFactorAuthenticationCodeDto: TwoFactorAuthenticationCodeDto) {
        const isValid : boolean = await this.authService.validateTwoFactorAuthenticationCode(user, twoFactorAuthenticationCodeDto.code);

        if (isValid) {
            await this.userService.enableTwoFactorAuthentication(user);
        } else {
            throw new UnauthorizedException('Wrong two factor authentication code');
        }
    }
}