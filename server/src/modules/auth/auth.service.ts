import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';
import { RegistrationKey } from './entities/registration-key.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RegistrationKey)
    private readonly regKeyRepository: Repository<RegistrationKey>,
  ) {}

  private buildJwtPayload(userId: string, email: string, organizationId: string | undefined, role: UserRole) {
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

    const superAdminKey = this.configService.get<string>('SUPER_ADMIN_KEY');
    const isSuperAdmin = superAdminKey && registerDto.registrationKey === superAdminKey;

    let role: UserRole;
    let organizationId: string | undefined = undefined;

    if (isSuperAdmin) {
      role = UserRole.SUPER_ADMIN;
    } else {
      const regKey = await this.regKeyRepository.findOne({
        where: { key: registerDto.registrationKey, used: false },
      });
      if (!regKey) {
        throw new BadRequestException('Invalid or already used registration key');
      }

      const organization = await this.organizationsService.create(regKey.organizationName);
      organizationId = organization.id;
      role = UserRole.MANAGER;

      regKey.used = true;
      regKey.usedByEmail = registerDto.email;
      regKey.organizationId = organization.id;
      await this.regKeyRepository.save(regKey);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role,
      organizationId,
    });

    const payload = this.buildJwtPayload(user.id, user.email, organizationId, user.role);

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

  async generateOrgKey(organizationName: string): Promise<RegistrationKey> {
    const key = crypto.randomBytes(16).toString('hex');
    const regKey = this.regKeyRepository.create({
      key,
      organizationName,
    });
    return this.regKeyRepository.save(regKey);
  }

  async getAllKeys(): Promise<RegistrationKey[]> {
    return this.regKeyRepository.find({ order: { createdAt: 'DESC' } });
  }

  async deleteKey(id: string): Promise<void> {
    await this.regKeyRepository.delete(id);
  }
}
