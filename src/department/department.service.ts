import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findFirst({
      where: {
        OR: [{ name: dto.name }, { code: dto.code }],
      },
    });

    if (existing) {
      throw new BadRequestException('Department name or code already exists');
    }

    return this.prisma.department.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true,
            designations: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            designation: true,
          },
        },
        designations: true,
      },
    });
  }

  async update(id: string, dto: Partial<CreateDepartmentDto>) {
    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const deptWithUsers = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            designations: true,
          },
        },
      },
    });

    if (
      !deptWithUsers ||
      deptWithUsers._count.users > 0 ||
      deptWithUsers._count.designations > 0
    ) {
      throw new BadRequestException(
        'Cannot delete department with assigned users or designations',
      );
    }

    return this.prisma.department.delete({
      where: { id },
    });
  }
}
