import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly jwtService: JwtService,
  ) {}

  private buildJwtPayload(userId: string, email: string, organizationId: string, role: UserRole) {
    return {
      sub: userId,
      email,
      orgId: organizationId,
      role,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const organization = await this.organizationsService.create(registerDto.organizationName);

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: registerDto.role || UserRole.ADMIN,
      organizationId: organization.id,
    });

    const payload = this.buildJwtPayload(user.id, user.email, organization.id, user.role);
    
    const { password, ...userResult } = user;
    return {
      user: userResult,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = this.buildJwtPayload(user.id, user.email, user.organizationId, user.role);
    
    const { password, ...userResult } = user;
    return {
      user: userResult,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
