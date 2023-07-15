import { Injectable } from "@nestjs/common";
import { Group, MessageDm, Prisma, PrismaClient } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class ChatRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    // MessageDM [C]
    public async createMessageDM(params: Prisma.MessageDmCreateArgs, prisma: PrismaClient = this.databaseService): Promise<MessageDm> {
        return await prisma.messageDm.create(params);
    }

    // MessageDMs [R]
    public async getDms(params: Prisma.MessageDmFindManyArgs,  prisma: PrismaClient = this.databaseService): Promise<MessageDm[]> {
        return await prisma.messageDm.findMany(params);
    }

    // Group [C]
    public async createGroup(params: Prisma.GroupCreateArgs, prisma: PrismaClient = this.databaseService): Promise<Group> {
        return prisma.group.create(params);
    }
}