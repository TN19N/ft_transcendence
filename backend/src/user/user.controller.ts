import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
    constructor(private userService: UserService) {}

    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
	uploadFile() {
        
	}

    @Get('hi')
    @HttpCode(HttpStatus.OK)
    hi() {
        return { hi: 'hi' }
    }
}