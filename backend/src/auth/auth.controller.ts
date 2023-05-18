import { Controller, Get, HttpCode, HttpStatus, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Intra42Guard } from './guard';
import { GetUser } from './decorator';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(Intra42Guard)
    async login(@GetUser() user: User) {
        return this.authService.login(user);
    }
}