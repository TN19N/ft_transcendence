import { Injectable } from "@nestjs/common";
import { MessageDm, PrismaClient } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class ChatRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    // Message dm [C-R]
    public async createNewDmMessage(senderId: string, receiverId: string, message: string, prisma: PrismaClient = this.databaseService): Promise<MessageDm> {
        return await prisma.messageDm.create({
            data: {
                sender: { connect: { id: senderId } },
                receiver: { connect: { id: receiverId } },
                content: message,
            }
        });
    }

    public async getDms(userId: string, prisma: PrismaClient = this.databaseService): Promise<MessageDm[]> {
        const messagesDm = await prisma.messageDm.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Filter and Keep just the last message from each dm
        const messagesDmFiltered: MessageDm[] = [];
        const dmPast = new Set<string>();

        for (const messageDm of messagesDm) {
            const uniqueKey = `${messageDm.senderId}|${messageDm.receiverId}`;
            if (!dmPast.has(uniqueKey)) {
                dmPast.add(uniqueKey);
                dmPast.add([...uniqueKey].reverse().join(''));
                messagesDmFiltered.push(messageDm);
            }
        }

        return messagesDmFiltered;
    }
}