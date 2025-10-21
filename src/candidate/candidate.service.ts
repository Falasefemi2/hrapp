import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CandidateStatus } from 'prisma/prisma/generated/prisma';
import { QueryCandidateDto } from './dto/query-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class CandidateService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateCandidateDto) {
    const existing = await this.prisma.candidate.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Candidate with this email already exists');
    }

    const candidate = await this.prisma.candidate.create({
      data: {
        ...dto,
        status: dto.status || CandidateStatus.SCREENING,
      },
    });

    // Send welcome email to candidate
    try {
      await this.emailService.sendWelcomeCandidateEmail(
        candidate.email,
        candidate.firstName,
        candidate.position,
      );
    } catch (error) {
      console.error('Failed to send welcome email to candidate:', error);
    }

    return candidate;
  }

  async findAll(query: QueryCandidateDto) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.department) {
      where.department = {
        contains: query.department,
        mode: 'insensitive',
      };
    }

    if (query.position) {
      where.position = {
        contains: query.position,
        mode: 'insensitive',
      };
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { position: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.candidate.findMany({
      where,
      include: {
        offers: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { offers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        offers: {
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            approvedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async update(id: string, dto: UpdateCandidateDto) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.candidate.update({
      where: { id },
      data: dto,
      include: {
        offers: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async remove(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { offers: true },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate._count.offers > 0) {
      throw new BadRequestException(
        'Cannot delete candidate with existing offers. Archive instead.',
      );
    }

    return this.prisma.candidate.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const total = await this.prisma.candidate.count();

    const byStatus = await this.prisma.candidate.groupBy({
      by: ['status'],
      _count: true,
    });

    const recentCandidates = await this.prisma.candidate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      total,
      byStatus: byStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {}),
      recentCandidates,
    };
  }
}
