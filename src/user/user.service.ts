/* eslint-disable prettier/prettier */
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from "bcryptjs"

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async createUser(id: string, createUserDto: CreateUserDto): Promise<User> {
        const { name, email, password } = createUserDto;
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
            }

        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                groupId: id
            },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

}

