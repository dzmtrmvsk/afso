import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SlaService } from './sla.service';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from './dto/sla-policy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sla-policies')
@UseGuards(JwtAuthGuard)
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Post()
  create(@Body() createSlaPolicyDto: CreateSlaPolicyDto, @Request() req) {
    return this.slaService.create(createSlaPolicyDto, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req) {
    return this.slaService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.slaService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSlaPolicyDto: UpdateSlaPolicyDto, @Request() req) {
    return this.slaService.update(id, updateSlaPolicyDto, req.user.organizationId);
  }
}
