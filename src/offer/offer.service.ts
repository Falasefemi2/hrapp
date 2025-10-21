// src/offer/offer.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { QueryOfferDto } from './dto/query-offer.dto';
import { RejectOfferDto } from './dto/reject-offer.dto';
import { CandidateRejectOfferDto } from './dto/candidate-reject-offer.dto';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  CandidateStatus,
  OfferStatus,
  UserStatus,
} from 'prisma/prisma/generated/prisma';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class OfferService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateOfferDto, createdById: string) {
    // Verify candidate exists
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: dto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Check if candidate already has an active offer
    const activeOffer = await this.prisma.offer.findFirst({
      where: {
        candidateId: dto.candidateId,
        status: {
          in: [OfferStatus.PENDING, OfferStatus.APPROVED],
        },
      },
    });

    if (activeOffer) {
      throw new BadRequestException(
        'Candidate already has an active offer pending',
      );
    }

    // Verify level exists if provided
    if (dto.levelId) {
      const level = await this.prisma.level.findUnique({
        where: { id: dto.levelId },
      });

      if (!level) {
        throw new NotFoundException('Level not found');
      }
    }

    // Generate acceptance token
    const acceptanceToken = randomBytes(32).toString('hex');

    // Set default expiry to 7 days if not provided
    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const offer = await this.prisma.offer.create({
      data: {
        candidateId: dto.candidateId,
        position: dto.position,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        levelId: dto.levelId,
        salary: dto.salary,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        offerLetter: dto.offerLetter,
        status: OfferStatus.PENDING,
        acceptanceToken,
        expiresAt,
        createdById,
      },
      include: {
        candidate: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update candidate status
    await this.prisma.candidate.update({
      where: { id: dto.candidateId },
      data: { status: CandidateStatus.OFFER_SENT },
    });

    // TODO: Send notification to EXCO for approval
    await this.createApprovalNotification(offer);

    return offer;
  }

  async findAll(query: QueryOfferDto) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.candidateId) {
      where.candidateId = query.candidateId;
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    return this.prisma.offer.findMany({
      where,
      include: {
        candidate: true,
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
    });
  }

  async findOne(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        candidate: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async update(id: string, dto: UpdateOfferDto) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException(
        'Cannot update offer that is not in pending status',
      );
    }

    return this.prisma.offer.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      include: {
        candidate: true,
        createdBy: {
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

  async approve(id: string, approvedById: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: { candidate: true },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Offer is not in pending status');
    }

    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: {
        status: OfferStatus.APPROVED,
        approvedById,
      },
      include: {
        candidate: true,
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
    });

    // Send offer letter email to candidate with acceptance link
    try {
      await this.emailService.sendOfferEmail(
        updatedOffer.candidate.email,
        `${updatedOffer.candidate.firstName} ${updatedOffer.candidate.lastName}`,
        updatedOffer.position,
        updatedOffer.acceptanceToken ?? '',
        {
          position: updatedOffer.position,
          department: updatedOffer.departmentId,
          salary: updatedOffer.salary,
          startDate: updatedOffer.startDate,
          expiresAt: updatedOffer.expiresAt,
        },
        // updatedOffer.acceptanceToken ?? '',
      );
    } catch (error) {
      console.error('Failed to send offer email to candidate:', error);
    }

    return updatedOffer;
  }

  async reject(id: string, dto: RejectOfferDto, rejectedById: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Offer is not in pending status');
    }

    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: {
        status: OfferStatus.REJECTED,
        rejectionReason: dto.rejectionReason,
        rejectedAt: new Date(),
      },
      include: {
        candidate: true,
      },
    });

    // Update candidate status back to previous state
    await this.prisma.candidate.update({
      where: { id: offer.candidateId },
      data: { status: CandidateStatus.SCREENING },
    });

    // TODO: Notify HR about rejection
    await this.notifyHROfRejection(updatedOffer, rejectedById);

    return updatedOffer;
  }

  async acceptOffer(token: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { acceptanceToken: token },
      include: { candidate: true },
    });

    if (!offer) {
      throw new NotFoundException('Invalid offer token');
    }

    if (offer.status !== OfferStatus.APPROVED) {
      throw new BadRequestException('Offer is not approved yet');
    }

    // Check if offer has expired
    if (offer.expiresAt && offer.expiresAt < new Date()) {
      await this.prisma.offer.update({
        where: { id: offer.id },
        data: { status: OfferStatus.EXPIRED },
      });
      throw new BadRequestException('Offer has expired');
    }

    // Update offer status
    const acceptedOffer = await this.prisma.offer.update({
      where: { id: offer.id },
      data: {
        status: OfferStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: {
        candidate: true,
      },
    });

    // Update candidate status
    await this.prisma.candidate.update({
      where: { id: offer.candidateId },
      data: { status: CandidateStatus.OFFER_ACCEPTED },
    });

    // Create user account
    const user = await this.createUserFromOffer(acceptedOffer);

    return { offer: acceptedOffer, user };
  }

  async candidateRejectOffer(dto: CandidateRejectOfferDto) {
    const offer = await this.prisma.offer.findUnique({
      where: { acceptanceToken: dto.token },
      include: { candidate: true },
    });

    if (!offer) {
      throw new NotFoundException('Invalid offer token');
    }

    if (offer.status !== OfferStatus.APPROVED) {
      throw new BadRequestException('Offer is not approved');
    }

    // Update offer status
    const rejectedOffer = await this.prisma.offer.update({
      where: { id: offer.id },
      data: {
        status: OfferStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: dto.rejectionReason || 'Rejected by candidate',
      },
      include: {
        candidate: true,
      },
    });

    // Update candidate status
    await this.prisma.candidate.update({
      where: { id: offer.candidateId },
      data: { status: CandidateStatus.OFFER_REJECTED },
    });

    // TODO: Notify HR
    await this.notifyHROfCandidateRejection(rejectedOffer);

    return rejectedOffer;
  }

  async withdraw(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (
      offer.status !== OfferStatus.PENDING &&
      offer.status !== OfferStatus.APPROVED
    ) {
      throw new BadRequestException('Cannot withdraw this offer');
    }

    const withdrawnOffer = await this.prisma.offer.update({
      where: { id },
      data: {
        status: OfferStatus.WITHDRAWN,
      },
    });

    // Update candidate status
    await this.prisma.candidate.update({
      where: { id: offer.candidateId },
      data: { status: CandidateStatus.SCREENING },
    });

    return withdrawnOffer;
  }

  private async createUserFromOffer(offer: any) {
    // Get employee role
    const employeeRole = await this.prisma.role.findUnique({
      where: { code: 'EMPLOYEE' },
    });

    if (!employeeRole) {
      throw new BadRequestException('Employee role not found');
    }

    // Generate employee code
    const employeeCode = await this.generateEmployeeCode();

    // Generate temporary password
    const tempPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user account
    const user = await this.prisma.user.create({
      data: {
        employeeCode,
        firstName: offer.candidate.firstName,
        lastName: offer.candidate.lastName,
        email: offer.candidate.email,
        phoneNumber: offer.candidate.phoneNumber,
        password: hashedPassword,
        roleId: employeeRole.id,
        departmentId: offer.departmentId,
        designationId: offer.designationId,
        levelId: offer.levelId,
        status: UserStatus.PENDING,
      },
    });

    // Update candidate to onboarding
    await this.prisma.candidate.update({
      where: { id: offer.candidateId },
      data: { status: CandidateStatus.ONBOARDING },
    });

    // TODO: Send welcome email with credentials
    await this.sendWelcomeEmail(user, tempPassword);

    return user;
  }

  private async generateEmployeeCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await this.prisma.user.count();
    const sequence = (count + 1).toString().padStart(4, '0');
    return `EMP${year}${sequence}`;
  }

  private generateTemporaryPassword(): string {
    return randomBytes(8).toString('hex');
  }

  private async createApprovalNotification(offer: any) {
    // Get all EXCO users
    const excoRole = await this.prisma.role.findUnique({
      where: { code: 'EXCO' },
      include: { users: true },
    });

    if (excoRole && excoRole.users.length > 0) {
      const notifications = excoRole.users.map((user) => ({
        userId: user.id,
        title: 'New Offer Pending Approval',
        message: `New offer for ${offer.candidate.firstName} ${offer.candidate.lastName} requires your approval`,
        type: 'OFFER_RECEIVED' as any,
        relatedId: offer.id,
      }));

      await this.prisma.notification.createMany({
        data: notifications,
      });
    }
  }

  private async notifyHROfRejection(offer: any, rejectedById: string) {
    // Get all HR users
    const hrRole = await this.prisma.role.findUnique({
      where: { code: 'HR' },
      include: { users: true },
    });

    if (hrRole && hrRole.users.length > 0) {
      const notifications = hrRole.users.map((user) => ({
        userId: user.id,
        title: 'Offer Rejected',
        message: `Offer for ${offer.candidate.firstName} ${offer.candidate.lastName} was rejected`,
        type: 'OFFER_RECEIVED' as any,
        relatedId: offer.id,
      }));

      await this.prisma.notification.createMany({
        data: notifications,
      });
    }
  }

  private async notifyHROfCandidateRejection(offer: any) {
    // Get all HR users
    const hrRole = await this.prisma.role.findUnique({
      where: { code: 'HR' },
      include: { users: true },
    });

    if (hrRole && hrRole.users.length > 0) {
      const notifications = hrRole.users.map((user) => ({
        userId: user.id,
        title: 'Candidate Rejected Offer',
        message: `${offer.candidate.firstName} ${offer.candidate.lastName} rejected the offer`,
        type: 'OFFER_RECEIVED' as any,
        relatedId: offer.id,
      }));

      await this.prisma.notification.createMany({
        data: notifications,
      });
    }
  }

  private async sendWelcomeEmail(user: any, tempPassword: string) {
    // TODO: Implement email sending
    console.log(`Sending welcome email to ${user.email}`);
    console.log(`Temporary password: ${tempPassword}`);
  }

  async getStatistics() {
    const total = await this.prisma.offer.count();

    const byStatus = await this.prisma.offer.groupBy({
      by: ['status'],
      _count: true,
    });

    const recentOffers = await this.prisma.offer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            position: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      total,
      byStatus: byStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {}),
      recentOffers,
    };
  }
}
