import { 
    BadRequestException,
    Body, 
    ConflictException, 
    Controller, 
    Get, 
    HttpCode, 
    HttpStatus,
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
import { Friendship, User, UserPreferences, UserProfile } from '@prisma/client';
import { TwoFactorAuthenticationCodeDto } from './../authentication/dto';
import { Request, Response } from 'express';
import { AuthenticationService } from './../authentication/authentication.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserProfileDto } from './dto';
import * as fs from 'fs';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiProduces,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiUnsupportedMediaTypeResponse
} from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
@UseGuards(JwtGuard)
@ApiUnauthorizedResponse({description: "unauthorize"})
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authenticationService: AuthenticationService,
    ) {}

    // this is for testing purpose
    @ApiTags("testing")
    @Post('addRandomUser')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({description: "random user crated"})
    async addRandomUser() {
        await this.userService.addRandomUser();
    }

    // this is for testing purpose
    @ApiTags("testing")
    @Get('switchToUser')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({description: "switched to the user"})
    @ApiNotFoundResponse({description: "user with id not found!"})
    @ApiBadRequestResponse({description: "'id query parameter is required'"})
    async switch(@Req() request: Request, @Query('id') id?: string) {
        if (id) {
            const user: User | null = await this.userService.getUser(id);

            if (user) {
                request.res!.setHeader('Set-Cookie', await this.authenticationService.getLoginCookie(id));
            } else {
                throw new NotFoundException(`user with the id "${id}" not found`)
            }
        } else {
            throw new BadRequestException("'id' query parameter is required");
        }
    }

    @Post('ban')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({description: "user banned!"})
    @ApiNotFoundResponse({description: "user with id not found!"})
    @ApiBadRequestResponse({description: "'id' query parameter is required"})
    async banUser(@GetUserId() userId: string, @Query('id') id?: string) {
        if (id) {
            if (userId === id) {
                throw new ConflictException("you can't ban yourself! hhh");
            } else {
                await this.userService.banUser(userId, id);
            }
        } else {
            throw new BadRequestException("'id' query parameter is required");
        }
    }

    @Post('unban')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({description: "user unbanned!"})
    @ApiNotFoundResponse({description: "user with id not found!"})
    @ApiBadRequestResponse({description: "'id' query parameter is required"})
    async unbanUser(@GetUserId() userId: string, @Query('id') id?: string) {
        if (id) {
            if (userId === id) {
                throw new ConflictException("you can't unban yourself! hhh what are you doing get some help hh");
            } else {
                await this.userService.unbanUser(userId, id);
            }
        } else {
            throw new BadRequestException("'id' query parameter is required");
        }
    }

    @Get('ban')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "banned users returned! User[]"})
    @ApiNotFoundResponse({description: "user with id not found!"})
    async getBannedUsers(@GetUserId() userId: string) {
        return await this.userService.getBannedUsers(userId);
    }

    @Get('search')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "search result returned! User[]"})
    @ApiBadRequestResponse({description: "'query' query parameter is required"})
    async search(@Query('query') query?: string) {
        if (query) {
            return await this.userService.search(query);
        } else {
            throw new BadRequestException("'query' query parameter is required");
        }
    }

    @Get('friendRequests/received')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "received friend requests returned! FriendRequest[]"})
    async getFriendRequests(@GetUserId() userId: string) {
        return await this.userService.getFriendRequestsReceived(userId);
    }

    @Get('friendRequests/sent')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "sente friend requests returned! FriendRequest[]"})
    async getFriendRequestsSent(@GetUserId() userId: string) {
        return await this.userService.getFriendRequestsSent(userId);
    }
 
    @Post('acceptFriendRequest')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({description: "friend request accepted!"})
    @ApiNotFoundResponse({description: "friend request from user with the id not found!"})
    @ApiBadRequestResponse({description: "'friendId' query parameter is required"})
    async acceptFriendRequest(@GetUserId() userId: string, @Query('friendId') friendId?: string) {
        if (friendId) {
            const friendship: Friendship | null = await this.userService.acceptFriendRequest(userId, friendId);
            if (!friendship) {
                throw new NotFoundException(`friend request from user with the id '${friendId}' not found`);
            }
        } else {
            throw new BadRequestException('friendId query parameter is required');
        }
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('avatar', {
        fileFilter: (_req, file, callback) => {
            if (file.mimetype === 'image/png') {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        storage: diskStorage({
            destination: './upload/',
            filename: (req, _file, callback) => {
                const user: User = req.user as User;
                callback(null, `${user.id}`);
            }
        }),
    }))
    @HttpCode(HttpStatus.CREATED)
    @ApiConsumes('multipart/form-data')
    @ApiCreatedResponse({description: "avatar uploaded!"})
    @ApiUnsupportedMediaTypeResponse({description: "only png files are allowed!"})
    async postAvatar(@UploadedFile() file: Express.Multer.File) {
        if (file === undefined) {
            throw new UnsupportedMediaTypeException('Only png files are allowed');
        }
    }

    @Get('avatar')
    @HttpCode(HttpStatus.OK)
    @ApiProduces('image/png')
    @ApiOkResponse({description: "avatar returned! image/png"})
    @ApiNotFoundResponse({description: "user avatar not found!"})
    @ApiQuery({name: "id", required: false})
    async getAvatar(@GetUserId() userId: string, @Res() response: Response, @Query('id') id?: string) {
        id = id ?? userId;

        if (fs.existsSync(`./upload/${id}`)) {
            response.setHeader('Content-Type', 'image/png');
            response.setHeader('Content-Disposition', 'attachment; filename=avatar.png');
            response.statusCode = HttpStatus.OK;
            response.download(`./upload/${id}`);
        } else {
            throw new NotFoundException('User Avatar not found');
        }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "user returned! User{}"})
    @ApiNotFoundResponse({description: "user with the id not found!"})
    @ApiQuery({name: "id", required: false})
    async getUser(@GetUserId() userId: string, @Query('id') id?: string) {
        const user = await this.userService.getUser(id ?? userId);

        if (user) {
            return user;
        } else {
            throw new NotFoundException(`user with the id '${id ?? userId}' not found`);
        }
    }

    @Post('friendRequest')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({description: "friend request sent"})
    @ApiConflictResponse({description: "friend request conflicted"})
    @ApiNotFoundResponse({description: "the user with friendId not found"})
    @ApiBadRequestResponse({description: "'friendId' query parameter is required"})
    async sendFriendRequest(@GetUserId() userId: string, @Query('friendId') friendId?: string) {
        if (friendId) {
            await this.userService.sendFriendRequest(userId, friendId);
        } else {
            throw new BadRequestException("'friendId' query parameter is required");
        }
    }

    @Get('friends')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "user friends returned! User[]"})
    @ApiNotFoundResponse({description: "failed to find user friends!"})
    async getFriends(@GetUserId() userId: string) {
        const friends: User[] | null = await this.userService.getUserFriends(userId);

        if (friends) {
            return friends;
        } else {
            throw new NotFoundException("Failed to find user friends");
        }
    }

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "user profile returned! UserProfile{}"})
    @ApiNotFoundResponse({description: "failed to find user profile!"})
    @ApiQuery({name: "id", required: false})
    async getProfile(@GetUserId() userId: string, @Query('id') id?: string) {
        const profile: UserProfile | null = await this.userService.getUserProfile(id ?? userId);

        if (profile) {
            return profile;
        } else {
            throw new NotFoundException("Failed to find user profile");
        }
    }

    @Post('profile')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({description: "user profile updated!"})
    @ApiConflictResponse({description: "user profile conflicted!"})
    async updateUserProfile(@GetUserId() userId: string, @Body() userProfileDto: UserProfileDto) {
        await this.userService.updateUserProfile(userId, userProfileDto);
    }

    @Get('preferences')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({description: "user preferences returned! UserPreferences{}"})
    @ApiNotFoundResponse({description: "failed to find user preferences!"})
    async getPreferences(@GetUserId() userId: string) {
        const preferences: UserPreferences | null =  await this.userService.getUserPreferences(userId);

        if (preferences) {
            return preferences;
        } else {
            throw new NotFoundException("Failed to find user preferences");
        }
    }

    @Post('turnOn2fa')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({description: "two factor authentication turned on! QRCode"})
    @ApiNotFoundResponse({description: "failed to find user data!"})
    async turnOnTwoFactorAuthentication(@GetUserId() userId: string) {
        return await this.userService.turnOnTwoFactorAuthentication(userId);
    }

    @Post('turnOff2fa')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({description: "two factor authentication turned off!"})
    async turnOffTwoFactorAuthentication(@GetUserId() user: string) {
        await this.userService.turnOffTwoFactorAuthentication(user);
    }

    @Post('enable2fa')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({description: "two factor authentication enabled!"})
    @ApiNotFoundResponse({description: "failed to find user data!"})
    @ApiUnauthorizedResponse({description: "wrong two factor authentication code!"})
    async enable2FA(@GetUserId() userId: string, @Body() twoFactorAuthenticationCodeDto: TwoFactorAuthenticationCodeDto) {
        const isValid : boolean = await this.authenticationService.validateTwoFactorAuthenticationCode(userId, twoFactorAuthenticationCodeDto.code);

        if (isValid) {
            await this.userService.enableTwoFactorAuthentication(userId);
        } else {
            throw new UnauthorizedException('Wrong two factor authentication code');
        }
    }
}