import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, organizationId: string): Promise<Customer> {
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      organizationId,
    });
    return this.customerRepository.save(customer);
  }

  async findAll(organizationId: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: { organizationId },
    });
  }

  async findOne(id: string, organizationId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id, organizationId },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, organizationId: string): Promise<Customer> {
    const customer = await this.findOne(id, organizationId);
    Object.assign(customer, updateCustomerDto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const customer = await this.findOne(id, organizationId);
    await this.customerRepository.remove(customer);
  }
}
