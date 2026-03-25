import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto/team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @Request() req) {
    return this.teamsService.create(createTeamDto, req.user.organizationId);
  }

  @Get()
  findAll(@Request() req) {
    return this.teamsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.teamsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto, @Request() req) {
    return this.teamsService.update(id, updateTeamDto, req.user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.teamsService.remove(id, req.user.organizationId);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() addMemberDto: AddTeamMemberDto, @Request() req) {
    return this.teamsService.addMember(id, addMemberDto.userId, req.user.organizationId);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') teamId: string, @Param('userId') userId: string, @Request() req) {
    return this.teamsService.removeMember(teamId, userId, req.user.organizationId);
  }
}
