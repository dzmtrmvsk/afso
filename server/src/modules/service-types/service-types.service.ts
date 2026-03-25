import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceType } from './entities/service-type.entity';
import { CreateServiceTypeDto, UpdateServiceTypeDto } from './dto/service-type.dto';

@Injectable()
export class ServiceTypesService {
  constructor(
    @InjectRepository(ServiceType)
    private readonly serviceTypeRepository: Repository<ServiceType>,
  ) {}

  async create(createServiceTypeDto: CreateServiceTypeDto, organizationId: string): Promise<ServiceType> {
    const serviceType = this.serviceTypeRepository.create({
      ...createServiceTypeDto,
      organizationId,
    });
    return this.serviceTypeRepository.save(serviceType);
  }

  async findAll(organizationId: string): Promise<ServiceType[]> {
    return this.serviceTypeRepository.find({
      where: { organizationId },
    });
  }

  async findOne(id: string, organizationId: string): Promise<ServiceType> {
    const serviceType = await this.serviceTypeRepository.findOne({
      where: { id, organizationId },
    });
    if (!serviceType) {
      throw new NotFoundException(`Service Type with ID ${id} not found`);
    }
    return serviceType;
  }

  async update(id: string, updateServiceTypeDto: UpdateServiceTypeDto, organizationId: string): Promise<ServiceType> {
    const serviceType = await this.findOne(id, organizationId);
    Object.assign(serviceType, updateServiceTypeDto);
    return this.serviceTypeRepository.save(serviceType);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const serviceType = await this.findOne(id, organizationId);
    await this.serviceTypeRepository.remove(serviceType);
  }
}
