import { 
    BadRequestException,
    Body, 
    Controller, 
    Get, 
    HttpCode, 
    HttpStatus,
    InternalServerErrorException,
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
import * as fs from 'fs';

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

    // this is for testing purpose
    @Post('add')
    @HttpCode(HttpStatus.CREATED)
    async add() {
        await this.userService.addRandomUser();
    }

    // this is for testing purpose
    @Get('switch')
    @HttpCode(HttpStatus.CREATED)
    async switch( @Res({ passthrough: true }) response: Response, @Query('userId') userId?: string) {
        if (userId) {
            const user: User = await this.userService.getUserById(userId, true);
            response.setHeader('Set-Cookie', await this.authService.getLoginCookie(user, false));
        } else {
            throw new BadRequestException('userId query parameter is required');
        }
    }

    @Get('friendRequests')
    @HttpCode(HttpStatus.OK)
    async getFriendRequests(@GetUser() user: User) {
        return await this.userService.getFriendRequests(user);
    }

    @Get('friendRequestsSent')
    @HttpCode(HttpStatus.OK)
    async getFriendRequestsSent(@GetUser() user: User) {
        return await this.userService.getFriendRequestsSent(user);
    }

    @Post('acceptFriendRequest')
    @HttpCode(HttpStatus.CREATED)
    async acceptFriendRequest(@GetUser() user: User, @Query('friendRequestId') friendId?: string) {
        if (friendId) {
            await this.userService.acceptFriendRequest(user, friendId);
        } else {
            throw new BadRequestException('friendRequestId query parameter is required');
        }
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
        userId = userId ?? user.id;

        await this.userService.getUserById(userId, userId === user.id);

        if (fs.existsSync(`./upload/${userId}`)) {
            response.setHeader('Content-Type', 'image/png');
            response.download(`./upload/${userId}`);
        } else {
            throw new InternalServerErrorException('Avatar not found');
        }
    }

    @Get('')
    @HttpCode(HttpStatus.OK)
    async getUser(@GetUser() user: User, @Query('userId') userId?: string) {
        userId = userId ?? user.id;
        return await this.userService.getUserById(userId, userId === user.id);
    }

    @Post('friend')
    @HttpCode(HttpStatus.CREATED)
    async postFriend(@GetUser() user: User, @Query('friendId') friendId?: string) {
        if (friendId) {
            await this.userService.postFriend(user, friendId);
        } else {
            throw new BadRequestException('friendId query parameter is required');
        }
    }

    @Get('friends')
    @HttpCode(HttpStatus.OK)
    async getFriends(@GetUser() user: User) {
        return await this.userService.getFriends(user);
    }

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(@GetUser() user: User, @Query('profileId') profileId?: string) {
        profileId = profileId ?? user.profileId;
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