import { Injectable } from "@nestjs/common";
import { Group, Message, MessageDm, Prisma, PrismaClient } from "@prisma/client";
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

    // Group [R-C-U]
    public async getGroup(params: Prisma.GroupFindUniqueArgs, prisma: PrismaClient = this.databaseService): Promise<Group | null> {
        return await prisma.group.findUnique(params);
    }

    public async createGroup(params: Prisma.GroupCreateArgs, prisma: PrismaClient = this.databaseService): Promise<Group> {
        return await prisma.group.create(params);
    }

    public async updateGroup(params: Prisma.GroupUpdateArgs, prisma: PrismaClient = this.databaseService): Promise<Group> {
        return await prisma.group.update(params);
    }

    // Groups [R]
    public async getGroups(params: Prisma.GroupFindManyArgs, prisma: PrismaClient = this.databaseService): Promise<Group[]> {
        return await prisma.group.findMany(params);
    }

    // Group messages [R-C]
    public async getGroupMessages(params: Prisma.MessageFindManyArgs, prisma: PrismaClient = this.databaseService): Promise<Message[]> {
        return await prisma.message.findMany(params);
    }
}