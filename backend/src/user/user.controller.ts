import { 
    Body, 
    Controller, 
    Get, 
    HttpCode, 
    HttpStatus,
    Param,
    Post, 
    Query, 
    Res, 
    UnauthorizedException, 
    UnsupportedMediaTypeException, 
    UploadedFile, 
    UseGuards,
    UseInterceptors, 
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { TwoFactorAuthenticationCodeDto } from 'src/auth/dto';
import { Response } from 'express';
import { AuthService } from './../auth/auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserProfileDto } from './dto';

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

    @Post('avatar')
    @UseInterceptors(FileInterceptor('avatar', {
        fileFilter: (req, file, callback) => {
            if (file.mimetype === 'image/png') {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        storage: diskStorage({
            destination: './upload/',
            filename: (req, file, callback) => {
                const user: User = req.user as User;
                callback(null, `${user.id}`);
            }
        }),
    }))
    @HttpCode(HttpStatus.CREATED)
    async postAvatar(@GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
        if (file === undefined) {
            throw new UnsupportedMediaTypeException('Only png files are allowed');
        }
    }

    @Get('avatar')
    @HttpCode(HttpStatus.OK)
    async getAvatar(@GetUser() user: User, @Res() response: Response, @Query('userId') userId?: string) {
        if (!userId) { userId = user.id }

        const user2: User = await this.userService.getUserById(userId);

        response.setHeader('Content-Type', 'image/png');
        response.download(`./upload/${user2.id}`);
    }

    @Get('')
    @HttpCode(HttpStatus.OK)
    async getUser(@GetUser() user: User, @Query('userId') userId?: string) {
        if (!userId) { userId = user.id }
        return await this.userService.getUserById(userId);
    }

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(@GetUser() user: User, @Query('profileId') profileId?: string) {
        if (!profileId) { profileId = user.profileId }
        return await this.userService.getUserProfile(profileId);
    }

    @Post('profile')
    @HttpCode(HttpStatus.CREATED)
    async postProfile(@GetUser() user: User, @Body() userProfileDto: UserProfileDto) {
        await this.userService.postUserProfile(user, userProfileDto);
    }

    @Get('preferences')
    @HttpCode(HttpStatus.OK)
    async getPreferences(@GetUser() user: User) {
        return await this.userService.getUserPreferences(user.preferencesId);
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