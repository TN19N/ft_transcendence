import { 
    BadRequestException,
    Body, 
    Controller, 
    Get, 
    HttpCode, 
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Post, 
    Query, 
    Req, 
    Res, 
    UnauthorizedException, 
    UnsupportedMediaTypeException, 
    UploadedFile, 
    UseGuards,
    UseInterceptors, 
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from './../authentication/guard';
import { GetUserId } from './../authentication/decorator';
import { FriendRequest, User, UserPreferences, UserProfile } from '@prisma/client';
import { TwoFactorAuthenticationCodeDto } from './../authentication/dto';
import { Request, Response } from 'express';
import { AuthenticationService } from './../authentication/authentication.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserProfileDto } from './dto';
import * as fs from 'fs';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authenticationService: AuthenticationService,
    ) {}

    // this is for testing purpose
    @Post('addUser')
    @HttpCode(HttpStatus.CREATED)
    async addRandomUser() {
        await this.userService.addRandomUser();
    }

    // this is for testing purpose
    @Get('switchToUser')
    @HttpCode(HttpStatus.CREATED)
    async switch(@Req() request: Request, @Query('id') id?: string) {
        if (id) {
            const user: User | null = await this.userService.getUser(id);

            if (user) {
                request.res!.setHeader('Set-Cookie', await this.authenticationService.getLoginCookie(id));
            } else {
                throw new NotFoundException(`user with the id \"${id}\" not found`)
            }
        } else {
            throw new BadRequestException("'id' query parameter is required");
        }
    }

    @Get('search')
    @HttpCode(HttpStatus.OK)
    async search(@Query('query') query?: string) {
        if (query) {
            return await this.userService.search(query);
        } else {
            throw new BadRequestException("'query' query parameter is required");
        }
    }

    @Get('friendRequests/received')
    @HttpCode(HttpStatus.OK)
    async getFriendRequests(@GetUserId() userId: string) {
        return await this.userService.getFriendRequestsReceived(userId);
    }

    @Get('friendRequests/sent')
    @HttpCode(HttpStatus.OK)
    async getFriendRequestsSent(@GetUserId() userId: string) {
        return await this.userService.getFriendRequestsSent(userId);
    }

    @Post('acceptFriendRequest')
    @HttpCode(HttpStatus.CREATED)
    async acceptFriendRequest(@GetUserId() userId: string, @Query('friendId') friendId?: string) {
        if (friendId) {
            await this.userService.acceptFriendRequest(userId, friendId);
        } else {
            throw new BadRequestException('friendId query parameter is required');
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
    async postAvatar(@UploadedFile() file: Express.Multer.File) {
        if (file === undefined) {
            throw new UnsupportedMediaTypeException('Only png files are allowed');
        }
    }

    @Get('avatar')
    async getAvatar(@GetUserId() userId: string, @Res() response: Response, @Query('id') id?: string) {
        id = id ?? userId;

        if (fs.existsSync(`./upload/${id}`)) {
            response.setHeader('Content-Type', 'image/png');
            response.setHeader('Content-Disposition', 'attachment; filename=avatar.png');
            response.statusCode = HttpStatus.OK;
            response.download(`./upload/${id}`);
        } else {
            throw new InternalServerErrorException('Avatar not found');
        }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getUser(@GetUserId() userId: string, @Query('id') id?: string) {
        id = id ?? userId;
        return await this.userService.getUser(id);
    }

    @Post('friendRequest')
    @HttpCode(HttpStatus.CREATED)
    async postFriendRequest(@GetUserId() user: string, @Query('friendId') friendId?: string) {
        if (friendId) {
            await this.userService.sendFriendRequest(user, friendId);
        } else {
            throw new BadRequestException('friendId query parameter is required');
        }
    }

    @Get('friends')
    @HttpCode(HttpStatus.OK)
    async getFriends(@GetUserId() userId: string) {
        const friends: User[] | null = await this.userService.getUserFriends(userId);

        if (friends) {
            return friends;
        } else {
            throw new InternalServerErrorException("Failed to find user friends");
        }
    }

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(@GetUserId() userId: string, @Query('id') id?: string) {
        const profile: UserProfile | null = await this.userService.getUserProfile(id ?? userId);

        if (profile) {
            return profile;
        } else {
            throw new InternalServerErrorException("Failed to find user profile");
        }
    }

    @Post('profile')
    @HttpCode(HttpStatus.CREATED)
    async updateUserProfile(@GetUserId() userId: string, @Body() userProfileDto: UserProfileDto) {
        await this.userService.updateUserProfile(userId, userProfileDto);
    }

    @Get('preferences')
    @HttpCode(HttpStatus.OK)
    async getPreferences(@GetUserId() userId: string) {
        const preferences: UserPreferences | null =  await this.userService.getUserPreferences(userId);

        if (preferences) {
            return preferences;
        } else {
            throw new InternalServerErrorException("Failed to find user preferences");
        }
    }

    @Post('turnOn2fa')
    @HttpCode(HttpStatus.CREATED)
    async turnOnTwoFactorAuthentication(@GetUserId() userId: string) {
        return await this.userService.turnOnTwoFactorAuthentication(userId);
    }

    @Post('turnOff2fa')
    @HttpCode(HttpStatus.CREATED)
    async turnOffTwoFactorAuthentication(@GetUserId() user: string) {
        await this.userService.turnOffTwoFactorAuthentication(user);
    }

    @Post('enable2fa')
    @HttpCode(HttpStatus.CREATED)
    async enable2FA(@GetUserId() userId: string, @Body() twoFactorAuthenticationCodeDto: TwoFactorAuthenticationCodeDto) {
        const isValid : boolean = await this.authenticationService.validateTwoFactorAuthenticationCode(userId, twoFactorAuthenticationCodeDto.code);

        if (isValid) {
            await this.userService.enableTwoFactorAuthentication(user);
        } else {
            throw new UnauthorizedException('Wrong two factor authentication code');
        }
    }
}