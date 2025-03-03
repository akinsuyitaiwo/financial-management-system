import { IsString } from 'class-validator';

export class JoinGroupDto {
  @IsString()
  userId: string;

  @IsString()
  groupId: string;
}
