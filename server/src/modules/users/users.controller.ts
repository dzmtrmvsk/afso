import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../shared/interfaces/auth-request.interface';

function generatePassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%&*';
  const all = upper + lower + digits + special;
  let pass = [
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    special[crypto.randomInt(special.length)],
  ];
  for (let i = 4; i < 12; i++) {
    pass.push(all[crypto.randomInt(all.length)]);
  }
  return pass.sort(() => Math.random() - 0.5).join('');
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.userId, req.user.organizationId);
  }

  @Post()
  @Roles(UserRole.MANAGER)
  async create(
    @Body() body: { email: string; firstName: string; lastName: string; position?: string; teamId?: string },
    @Request() req: AuthenticatedRequest,
  ) {
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = await this.usersService.create({
      email: body.email,
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
      role: UserRole.AGENT,
      position: body.position,
      organizationId: req.user.organizationId,
    });
    const { password, ...result } = user;
    return { ...result, generatedPassword: plainPassword };
  }

  @Get()
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  findAll(@Request() req: AuthenticatedRequest) {
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.usersService.findAllGlobal();
    }
    return this.usersService.findAllByOrganization(req.user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(id, req.user.role === UserRole.SUPER_ADMIN ? undefined : req.user.organizationId);
  }

  @Patch(':id/load')
  @Roles(UserRole.MANAGER)
  updateLoad(@Param('id') id: string, @Body('delta') delta: number) {
    return this.usersService.updateLoad(id, delta);
  }
}
