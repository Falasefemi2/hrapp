import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LevelService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLevelDto) {
    const existing = await this.prisma.level.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException('Level code already exists');
    }

    // Calculate total compensation
    const total = this.calculateTotal(dto);

    return this.prisma.level.create({
      data: {
        ...dto,
        total,
      },
    });
  }

  async findAll() {
    return this.prisma.level.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { basicSalary: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.level.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: Partial<CreateLevelDto>) {
    const currentLevel = await this.prisma.level.findUnique({
      where: { id },
    });

    const updatedData = { ...currentLevel, ...dto };
    const total = this.calculateTotal(updatedData);

    return this.prisma.level.update({
      where: { id },
      data: {
        ...dto,
        total,
      },
    });
  }

  async remove(id: string) {
    const levelWithUsers = await this.prisma.level.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!levelWithUsers) {
      throw new NotFoundException('Level not found');
    }

    if (levelWithUsers._count.users > 0) {
      throw new BadRequestException('Cannot delete level with assigned users');
    }

    return this.prisma.level.delete({
      where: { id },
    });
  }

  private calculateTotal(dto: any): number {
    return (
      (dto.basicSalary || 0) +
      (dto.transportAllowance || 0) +
      (dto.domesticAllowance || 0) +
      (dto.utilityAllowance || 0) +
      (dto.lunchSubsidy || 0) +
      (dto.entertainmentAllowance || 0) +
      (dto.telephoneAllowance || 0) +
      (dto.fuelAllowance || 0) +
      (dto.maintenanceAllowance || 0) +
      (dto.housingAllowance || 0) +
      (dto.dressingAllowance || 0) +
      (dto.furnitureAllowance || 0) +
      (dto.educationAllowance || 0) +
      (dto.medicalAllowance || 0) +
      (dto.passageAllowance || 0) +
      (dto.annualLeaveAllowance || 0) +
      (dto.thirteenthMonth || 0)
    );
  }
}
