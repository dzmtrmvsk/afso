import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlaPolicy } from './entities/sla-policy.entity';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from './dto/sla-policy.dto';
import { TicketPriority } from '../tickets/entities/ticket.entity';

@Injectable()
export class SlaService {
  constructor(
    @InjectRepository(SlaPolicy)
    private readonly slaPolicyRepository: Repository<SlaPolicy>,
  ) {}

  async create(createSlaPolicyDto: CreateSlaPolicyDto, organizationId: string): Promise<SlaPolicy> {
    const policy = this.slaPolicyRepository.create({
      ...createSlaPolicyDto,
      organizationId,
    });
    return this.slaPolicyRepository.save(policy);
  }

  async findAll(organizationId: string): Promise<SlaPolicy[]> {
    return this.slaPolicyRepository.find({
      where: { organizationId, isActive: true },
    });
  }

  async findOne(id: string, organizationId: string): Promise<SlaPolicy> {
    const policy = await this.slaPolicyRepository.findOne({
      where: { id, organizationId },
    });
    if (!policy) {
      throw new NotFoundException(`SLA Policy with ID ${id} not found`);
    }
    return policy;
  }

  async findByPriority(priority: TicketPriority, organizationId: string): Promise<SlaPolicy | null> {
    return this.slaPolicyRepository.findOne({
      where: { priority, organizationId, isActive: true },
    });
  }

  async update(id: string, updateSlaPolicyDto: UpdateSlaPolicyDto, organizationId: string): Promise<SlaPolicy> {
    const policy = await this.findOne(id, organizationId);
    Object.assign(policy, updateSlaPolicyDto);
    return this.slaPolicyRepository.save(policy);
  }

  async calculateDeadline(priority: TicketPriority, organizationId: string): Promise<Date | null> {
    const policy = await this.findByPriority(priority, organizationId);
    if (!policy) return null;

    const deadline = new Date();
    deadline.setMinutes(deadline.getMinutes() + policy.responseTimeMinutes);
    return deadline;
  }
}
