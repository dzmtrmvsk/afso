import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from './dto/subscription-plan.dto';
import { CreateSubscriptionDto, UpdateSubscriptionStatusDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
  ) {}

  // Plans Management
  async createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = this.planRepository.create(dto);
    return this.planRepository.save(plan);
  }

  async findAllPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({ where: { isActive: true } });
  }

  async findPlan(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    return plan;
  }

  async updatePlan(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = await this.findPlan(id);
    Object.assign(plan, dto);
    return this.planRepository.save(plan);
  }

  // Subscriptions Management
  async createSubscription(organizationId: string, dto: CreateSubscriptionDto): Promise<Subscription> {
    const plan = await this.findPlan(dto.planId);
    const subscription = this.subscriptionRepository.create({
      ...dto,
      organizationId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: SubscriptionStatus.ACTIVE,
      features: dto.features || plan.features,
    });
    return this.subscriptionRepository.save(subscription);
  }

  async findOrgSubscription(organizationId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { organizationId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
    if (!subscription) throw new NotFoundException('No active subscription found for organization');
    return subscription;
  }

  async updateStatus(id: string, organizationId: string, dto: UpdateSubscriptionStatusDto): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id, organizationId } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    subscription.status = dto.status;
    return this.subscriptionRepository.save(subscription);
  }
}
