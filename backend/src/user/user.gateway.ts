import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WsException } from "@nestjs/websockets";
import { DatabaseService } from "./../database/database.service";
import { JwtGuard } from "./../authentication/guard";
import { Socket } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { AuthenticationService } from "./../authentication/authentication.service";
import { JwtPayload } from "./../authentication/interface";
import { User, UserStatus } from "@prisma/client";

@WebSocketGateway({
    namespace: 'user',
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly authenticationService: AuthenticationService
        ) {}

    async handleConnection(client: Socket) {
        const user = await this.validateUser(client);

        if (user) {
            try {
                await this.databaseService.user.update({
                    where: { id: user.id },
                    data: {
                        profile: {
                            update: {
                                status: UserStatus.ONLINE,
                            }
                        }
                    }
                });
            } catch (error) {
                client.disconnect(true);
            }
        } else {
            client.disconnect(true);
        }
    }

    async handleDisconnect(client: Socket) {    
        const user = await this.validateUser(client);

        if (user) {
            try {
                await this.databaseService.user.update({
                    where: { id: user.id },
                    data: {
                        profile: {
                            update: {
                                status: UserStatus.OFFLINE,
                            }
                        }
                    }
                });
            } catch (error) {
                client.disconnect(true);
            }
        } else {
            client.disconnect(true);
        }
    }

    async validateUser(client: Socket) : Promise<User | null>{
        const jwt = client.handshake.headers.cookie?.split(';')
            .find(cookie => cookie.trim().startsWith('Authentication='))
            ?.split('=').at(1);

        if (jwt) {
            const payload: JwtPayload | null = await this.authenticationService.validateJwtToken(jwt);
    
            if (payload && payload.tfa == false) {
                return await this.databaseService.user.findUnique({
                    where: { id: payload.sub },
                });
            }
        }

        return null;
    }
}