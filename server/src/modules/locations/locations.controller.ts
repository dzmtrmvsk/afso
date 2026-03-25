import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { AuthenticatedRequest } from '../../shared/interfaces/auth-request.interface';

@Controller('locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  create(@Body() createLocationDto: CreateLocationDto, @Request() req: AuthenticatedRequest) {
    return this.locationsService.create(createLocationDto, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.locationsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.locationsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER)
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto, @Request() req: AuthenticatedRequest) {
    return this.locationsService.update(id, updateLocationDto, req.user.organizationId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.locationsService.remove(id, req.user.organizationId);
  }
}
