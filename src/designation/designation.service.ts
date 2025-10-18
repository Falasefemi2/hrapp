import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DesignationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDesignationDto) {
    const existing = await this.prisma.designation.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException('Designation code already exists');
    }

    return this.prisma.designation.create({
      data: dto,
      include: {
        department: true,
      },
    });
  }

  async findAll(departmentId?: string) {
    return this.prisma.designation.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: {
        department: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.designation.findUnique({
      where: { id },
      include: {
        department: true,
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

  async update(id: string, dto: Partial<CreateDesignationDto>) {
    return this.prisma.designation.update({
      where: { id },
      data: dto,
      include: {
        department: true,
      },
    });
  }

  async remove(id: string) {
    const designationWithUsers = await this.prisma.designation.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!designationWithUsers) {
      throw new BadRequestException('Designation not found');
    }

    if (designationWithUsers._count.users > 0) {
      throw new BadRequestException(
        'Cannot delete designation with assigned users',
      );
    }

    return this.prisma.designation.delete({
      where: { id },
    });
  }
}
