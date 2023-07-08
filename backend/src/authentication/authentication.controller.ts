import { 
    Body, 
    Controller, 
    Get, 
    HttpCode, 
    HttpStatus, 
    Post, 
    Req, 
    UnauthorizedException, 
    UseGuards
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Intra42Guard, JwtGuard } from './guard';
import { GetUserId } from './decorator';
import { Request } from 'express';
import { Jwt2faGuard } from './guard/jwt2fa.guard';
import { TwoFactorAuthenticationCodeDto } from './dto';
import { ApiCreatedResponse, ApiMovedPermanentlyResponse, ApiNoContentResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('authentication')
@Controller('auth')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}

    @Get('login')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(Intra42Guard)
    @ApiCreatedResponse({ description: 'login The User' })
    @ApiMovedPermanentlyResponse({ description: 'Redirect to 42 intra login page' })
    async login(@GetUserId() userId: string, @Req() request: Request) {
        request.res!.setHeader('Set-Cookie', await this.authenticationService.getLoginCookie(userId));
    }

    @Post('2fa')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(Jwt2faGuard)
    @ApiNoContentResponse({ description: 'verify 2fa code to be valid' })
    async validateTwoFactorAuthenticationCode(@GetUserId() userId: string, @Body() twoFactorAuthenticationCodeDto: TwoFactorAuthenticationCodeDto, @Req() request: Request) {
        const isValid : boolean = await this.authenticationService.validateTwoFactorAuthenticationCode(userId, twoFactorAuthenticationCodeDto.code);

        if (isValid) {
            request.res!.setHeader('Set-Cookie', await this.authenticationService.getLoginCookie(userId, false));
        } else {
            throw new UnauthorizedException('Wrong two factor authentication code');
        }
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtGuard)
    @ApiNoContentResponse({ description: 'logout The User' })
    async logout(@Req() request: Request) {
        request.res!.clearCookie('Authentication');
    }
}