/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
    @HttpCode(201)
    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
    }
}
