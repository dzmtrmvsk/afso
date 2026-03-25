import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto, UpdateServiceTypeDto } from './dto/service-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { AuthenticatedRequest } from '../../shared/interfaces/auth-request.interface';

@Controller('service-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createServiceTypeDto: CreateServiceTypeDto, @Request() req: AuthenticatedRequest) {
    return this.serviceTypesService.create(createServiceTypeDto, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.serviceTypesService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.serviceTypesService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateServiceTypeDto: UpdateServiceTypeDto, @Request() req: AuthenticatedRequest) {
    return this.serviceTypesService.update(id, updateServiceTypeDto, req.user.organizationId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.serviceTypesService.remove(id, req.user.organizationId);
  }
}
