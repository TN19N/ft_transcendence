import { 
    Body, 
    Controller, 
    Get, 
    HttpCode, 
    HttpStatus, 
    Post, 
    Res, 
    UnauthorizedException, 
    UnsupportedMediaTypeException, 
    UploadedFile, 
    UseGuards, 
    UseInterceptors 
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { TwoFaDto } from 'src/auth/dto';
import { Express, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
    constructor(private userService: UserService) {}

    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file', {
        fileFilter: (req, file, callback) => {
            if (file.mimetype == 'image/jpeg') {
                callback(null, true);
            } else {
                callback(null, false);
            }
        }
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
        if (file) {
            fs.writeFileSync(`${__dirname}/../../upload/${user.id}.jpg`, file.buffer);
            return 'File uploaded successfully';
        } else {
            throw new UnsupportedMediaTypeException('File type not supported')
        }
    }

    @Get('download')
    @HttpCode(HttpStatus.OK)
    async download(@GetUser() user: User, @Res() response: Response) {
        response.download(`${__dirname}/../../upload/${user.id}.jpg`)
    }

    @Post('switch2fa')
    @HttpCode(HttpStatus.CREATED)
    async switch2fa(@GetUser() user: User) {
        return this.userService.switch2fa(user);
    }

    @Post('enable2fa')
    @HttpCode(HttpStatus.CREATED)
    async enable2FA(@GetUser() user: User, @Body() twoFaDto: TwoFaDto) {
        if (user.twoFactorAuthenticationSecret != null && user.isTwoFactorAuthenticationEnabled == false) {
            const result: boolean = await this.userService.enable2fa(user, twoFaDto.twoFaCode);

            if (result == false) {
                throw new UnauthorizedException('wrong 2fa code!');
            }
        }
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    async me(@GetUser() user: User) {
        user.twoFactorAuthenticationSecret = null;
        return user;
    }
}