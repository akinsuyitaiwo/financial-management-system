import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/createGroup.dto';
import { JoinGroupDto } from './dto/joinGroup.dto';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async createGroup(data: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        name: data.name,
      },
    });
  }

  async joinGroup(data: JoinGroupDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException();
    }

    const group = await this.prisma.group.findUnique({
      where: { id: data.groupId },
    });

    if (!group) {
      throw new NotFoundException();
    }

    return this.prisma.user.update({
      where: { id: data.userId },
      data: {
        groupId: data.groupId,
      },
    });
  }
}
