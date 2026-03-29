import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../shared/interfaces/auth-request.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.userId, req.user.organizationId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() body: { email: string; password: string; firstName: string; lastName: string; role: UserRole }, @Request() req: AuthenticatedRequest) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await this.usersService.create({
      email: body.email,
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      organizationId: req.user.organizationId,
    });
    const { password, ...result } = user;
    return result;
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Request() req: AuthenticatedRequest) {
    return this.usersService.findAllByOrganization(req.user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(id, req.user.organizationId);
  }

  @Patch(':id/load')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  updateLoad(@Param('id') id: string, @Body('delta') delta: number) {
    return this.usersService.updateLoad(id, delta);
  }
}
