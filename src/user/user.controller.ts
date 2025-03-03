/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
    @HttpCode(201)
    @Post(':id')
    async createUser(@Body() createUserDto: CreateUserDto, @Param('id') id: string) {
    return this.userService.createUser(id, createUserDto);
    }
}
