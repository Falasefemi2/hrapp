import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @Roles('HR', 'ADMIN')
  @ApiOperation({ summary: 'Create User', description: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Get()
  @Roles('HR', 'ADMIN', 'HOD')
  @ApiOperation({ summary: 'Get Users', description: 'Get all users' })
  findAll(
    @Query('departmentId') departmentId?: string,
    @Query('roleId') roleId?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.userService.findAll({
      departmentId,
      roleId,
      status,
      isActive: isActive === 'true',
    });
  }

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('change-password')
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(user.id, dto);
  }

  @Patch(':id')
  @Roles('HR', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @Roles('HR', 'ADMIN')
  deactivate(@Param('id') id: string) {
    return this.userService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles('HR', 'ADMIN')
  activate(@Param('id') id: string) {
    return this.userService.activate(id);
  }

  @Delete(':id')
  @Roles('HR', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
