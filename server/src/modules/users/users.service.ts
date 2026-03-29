import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      relations: ['organization'] 
    });
  }

  async findOne(id: string, organizationId?: string): Promise<User> {
    const where: { id: string; organizationId?: string } = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }
    const user = await this.userRepository.findOne({ 
      where,
      relations: ['organization']
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findAllByOrganization(organizationId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllAgents(organizationId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { 
        organizationId, 
        role: UserRole.AGENT,
        status: UserStatus.ACTIVE 
      },
      order: {
        currentLoad: 'ASC'
      }
    });
  }

  async updateLoad(id: string, delta: number): Promise<void> {
    await this.userRepository.increment({ id }, 'currentLoad', delta);
  }
}
