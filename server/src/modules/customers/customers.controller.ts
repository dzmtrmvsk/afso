import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { AuthenticatedRequest } from '../../shared/interfaces/auth-request.interface';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req: AuthenticatedRequest) {
    return this.customersService.create(createCustomerDto, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.customersService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.customersService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Request() req: AuthenticatedRequest) {
    return this.customersService.update(id, updateCustomerDto, req.user.organizationId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.customersService.remove(id, req.user.organizationId);
  }
}
