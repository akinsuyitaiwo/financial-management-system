import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/createGroup.dto';
import { JoinGroupDto } from './dto/joinGroup.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('group')
@UseGuards(AuthGuard('jwt'))
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post()
  createGroup(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.createGroup(createGroupDto);
  }

  @Post('join')
  joinGroup(@Body() joinGroupDto: JoinGroupDto) {
    return this.groupService.joinGroup(joinGroupDto);
  }
}
