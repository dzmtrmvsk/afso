import { NotFoundException } from '@nestjs/common';
import { Repository, FindOptionsWhere, DeepPartial, ObjectLiteral } from 'typeorm';

export abstract class BaseEntityService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(createDto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async findAll(organizationId?: string): Promise<T[]> {
    if (organizationId) {
      return this.repository.find({
        where: { organizationId } as unknown as FindOptionsWhere<T>,
      });
    }
    return this.repository.find();
  }

  async findOne(id: string, organizationId?: string): Promise<T> {
    const where: any = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const entity = await this.repository.findOne({ where: where as FindOptionsWhere<T> });
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: DeepPartial<T>, organizationId?: string): Promise<T> {
    const entity = await this.findOne(id, organizationId);
    const merged = this.repository.merge(entity, updateDto);
    return this.repository.save(merged);
  }

  async remove(id: string, organizationId?: string): Promise<void> {
    const entity = await this.findOne(id, organizationId);
    await this.repository.remove(entity);
  }
}
