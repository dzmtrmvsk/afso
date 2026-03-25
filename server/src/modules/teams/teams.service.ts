import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createTeamDto: CreateTeamDto, organizationId: string): Promise<Team> {
    const team = this.teamRepository.create({
      ...createTeamDto,
      organizationId,
    });
    return this.teamRepository.save(team);
  }

  async findAll(organizationId: string): Promise<Team[]> {
    return this.teamRepository.find({
      where: { organizationId },
      relations: ['members'],
    });
  }

  async findOne(id: string, organizationId: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id, organizationId },
      relations: ['members'],
    });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto, organizationId: string): Promise<Team> {
    const team = await this.findOne(id, organizationId);
    Object.assign(team, updateTeamDto);
    return this.teamRepository.save(team);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const team = await this.findOne(id, organizationId);
    await this.teamRepository.remove(team);
  }

  async addMember(teamId: string, userId: string, organizationId: string): Promise<Team> {
    const team = await this.findOne(teamId, organizationId);
    const user = await this.userRepository.findOne({ where: { id: userId, organizationId } });
    if (!user) throw new NotFoundException('User not found');

    if (!team.members) team.members = [];
    team.members.push(user);
    
    return this.teamRepository.save(team);
  }

  async removeMember(teamId: string, userId: string, organizationId: string): Promise<Team> {
    const team = await this.findOne(teamId, organizationId);
    team.members = team.members.filter((member) => member.id !== userId);
    return this.teamRepository.save(team);
  }
}
