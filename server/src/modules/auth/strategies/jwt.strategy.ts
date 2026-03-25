import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../users/entities/user.entity';
import { AuthUser } from '../../../shared/interfaces/auth-request.interface';

interface ValidatePayload {
  sub: string;
  email: string;
  orgId: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
    });
  }

  async validate(payload: ValidatePayload): Promise<AuthUser> {
    return { 
      userId: payload.sub, 
      email: payload.email, 
      organizationId: payload.orgId,
      role: payload.role
    };
  }
}
