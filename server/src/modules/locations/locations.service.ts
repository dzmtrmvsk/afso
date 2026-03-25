import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto, organizationId: string): Promise<Location> {
    const location = this.locationRepository.create({
      ...createLocationDto,
      organizationId,
    });
    return this.locationRepository.save(location);
  }

  async findAll(organizationId: string): Promise<Location[]> {
    return this.locationRepository.find({
      where: { organizationId },
    });
  }

  async findOne(id: string, organizationId: string): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { id, organizationId },
    });
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto, organizationId: string): Promise<Location> {
    const location = await this.findOne(id, organizationId);
    Object.assign(location, updateLocationDto);
    return this.locationRepository.save(location);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const location = await this.findOne(id, organizationId);
    await this.locationRepository.remove(location);
  }
}
