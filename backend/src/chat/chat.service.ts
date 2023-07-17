import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { Group, GroupType, Message, MessageDm, Prisma } from '@prisma/client';
import { GroupDto } from './dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class ChatService {
    constructor(private readonly chatRepository: ChatRepository) {}

    public async leaveGroup(userId: string, groupId: string): Promise<Group> {
        const group = await this.chatRepository.getGroup({
            where: {
                id: groupId,
                users: {
                    some: {
                        id: userId,
                    },
                },
            },
        });

        if (!group) {
            throw new NotFoundException(`Group with id '${groupId}' not found!`);
        }

        if (group.ownerId === userId) {
            return await this.chatRepository.deleteGroup({
                where: {
                    id: groupId,
                },
            });
        } else {
            return await this.chatRepository.updateGroup({
                where: {
                    id: groupId,
                },
                data: {
                    users: {
                        disconnect: {
                            id: userId,
                        },
                    },
                    admins: {
                        disconnect: {
                            id: userId,
                        },
                    },
                },
            });
        }
    }

    public async joinGroup(userId: string, groupDto: GroupDto): Promise<Group> {
        if (groupDto.type === GroupType.PRIVATE) {
            throw new BadRequestException("can't join private groups!");
        }
        
        const group = await this.chatRepository.getGroup({
            where: { 
                name: groupDto.name,
                type: groupDto.type, 
            },
        });

        if (!group) {
            throw new NotFoundException(`Group with name '${groupDto.name}' not found!`);
        }

        if (group.type === GroupType.PROTECTED) {
            if (!groupDto.password) {
                throw new BadRequestException("password required for protected groups!")
            }

            const isPasswordValid = await bcrypt.compare(groupDto.password, group.password!);

            if (!isPasswordValid) {
                throw new UnauthorizedException("wrong password!")
            }
        }

        const isUserInGroup = await this.chatRepository.getGroup({
            where: {
                id: group.id,
                users: {
                    some: {
                        id: userId,
                    },
                },
            },
        });

        if (isUserInGroup) {
            throw new ConflictException(`You are already in group '${group.name}'!`)
        }

        return this.chatRepository.updateGroup({
            where: { id: group.id },
            data: {
                users: { connect: { id: userId } },
            },
        });
    }

    public async createGroup(userId: string, groupDto: GroupDto): Promise<Group> {
        if (groupDto.type === GroupType.PROTECTED) {
            if (!groupDto.password) {
                throw new BadRequestException("password required for protected groups!")
            }

            groupDto.password = await bcrypt.hash(groupDto.password, 10);
        } else {
            groupDto.password = undefined;
        }

        try {
            return await this.chatRepository.createGroup({
                data: {
                    ...groupDto,
                    owner:  {connect: {id: userId}},
                    users:  {connect: {id: userId}},
                    admins: {connect: {id: userId}}
                }
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException(`Group with name '${groupDto.name}' already exists!`)
                }
            }

            throw new InternalServerErrorException('Some Thing Went Wrong!')
        }
    }

    public async getGroup(id: string): Promise<Group | null> {
        return this.chatRepository.getGroup({
            where: { id: id },
        });
    }

    public async updateGroup(userId: string, groupId: string, groupDto: GroupDto): Promise<Group> {        
        let isAdmin = await this.chatRepository.getGroup({
            where: {
                id: groupId,
                admins: {
                    some: {
                        id: userId,
                    },
                },
            },
        });

        if (!isAdmin) {
            throw new UnauthorizedException("only admins can update the group!")
        }
        
        if (groupDto.type === GroupType.PROTECTED) {
            if (!groupDto.password) {
                throw new BadRequestException("password required for protected groups!")
            }

            groupDto.password = await bcrypt.hash(groupDto.password, 10);
        } else {
            groupDto.password = undefined;
        }

        try {
            return await this.chatRepository.updateGroup({
                where: { id: groupId },
                data: { ...groupDto },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException(`Group with name '${groupDto.name}' already exists!`)
                }
            }

            throw new InternalServerErrorException('Some Thing Went Wrong!')
        }
    }

    public async createMessageDm(senderId: string, receiverId: string, message: string) {
        return await this.chatRepository.createMessageDM({
            data: {
                sender: { connect: { id: senderId } },
                receiver: { connect: { id: receiverId } },
                content: message,
            }
        });
    }

    public async getDm(userId: string, id: string): Promise<MessageDm[]> {
        return await this.chatRepository.getDms({
            where: {
                OR: [
                    { senderId: userId, receiverId: id },
                    { senderId: id,     receiverId: userId },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            }
        });
    }

    public async getDms(userId: string): Promise<MessageDm[]> {
        const messagesDms = await this.chatRepository.getDms({
            where: {
                OR: [
                    {senderId: userId},
                    {receiverId: userId},
                ]
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        // Filter and Keep just the last message from each dm
        const messagesDmFiltered: MessageDm[] = [];
        const dmPast = new Set<string>();

        for (const messageDm of messagesDms) {
            const uniqueKey = `${messageDm.senderId}|${messageDm.receiverId}`;
            if (!dmPast.has(uniqueKey)) {
                dmPast.add(uniqueKey);
                dmPast.add([...uniqueKey].reverse().join(''));
                messagesDmFiltered.push(messageDm);
            }
        }

        return messagesDmFiltered;
    }

    public async getGroups(userId: string): Promise<Group[]> {
        return await this.chatRepository.getGroups({
            where: {
                OR: [
                    {
                        OR: [
                            {type: GroupType.PUBLIC},
                            {type: GroupType.PROTECTED},
                        ],
                    },
                    {
                        users: {
                            some: {
                                id: userId,
                            },
                        },
                    }
                ],
            },
            select: {
                id: true,
                name: true,
                type: true,
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            }
        });
    }

    public async getGroupMessages(userId: string, groupId: string): Promise<Group | null> {
        return await this.chatRepository.getGroup({
            where: {
                id: groupId,
                users: {
                    some: {
                        id: userId,
                    },
                },
            },

            select: {
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                users: true,
            },
        })
    }
}