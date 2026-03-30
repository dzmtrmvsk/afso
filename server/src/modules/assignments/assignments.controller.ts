import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, DeclineAssignmentDto } from './dto/assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Patch(':id/accept')
  @Roles(UserRole.AGENT)
  accept(@Param('id') id: string, @Request() req) {
    return this.assignmentsService.accept(id, req.user.userId);
  }

  @Patch(':id/decline')
  @Roles(UserRole.AGENT)
  decline(@Param('id') id: string, @Body() declineDto: DeclineAssignmentDto, @Request() req) {
    return this.assignmentsService.decline(id, req.user.userId, declineDto.reason);
  }

  @Patch(':id/complete')
  @Roles(UserRole.AGENT)
  complete(@Param('id') id: string, @Body('notes') notes: string, @Request() req) {
    return this.assignmentsService.complete(id, req.user.userId, notes);
  }

  @Get('my')
  @Roles(UserRole.AGENT)
  findMy(@Request() req) {
    return this.assignmentsService.findByAgent(req.user.userId);
  }
}
