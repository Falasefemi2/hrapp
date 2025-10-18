import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-user.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateUserDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }
    if (dto.employeeCode) {
      const existingCode = await this.prisma.user.findUnique({
        where: { employeeCode: dto.employeeCode },
      });

      if (existingCode) {
        throw new ConflictException(
          `Employee code ${dto.employeeCode} already exists`,
        );
      }
    }

    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    console.log('🔐 Generated temporary password');

    try {
      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          employeeCode: dto.employeeCode,
          password: hashedPassword,
          status: 'PENDING',
          isActive: true,
          phoneNumber: dto.phoneNumber,
          roleId: dto.roleId,
          departmentId: dto.departmentId,
          designationId: dto.designationId,
          levelId: dto.levelId,
        },
        include: {
          role: true,
          department: true,
          designation: true,
          level: true,
        },
      });
      this.emailService
        .sendCredentialsEmail(user.email, user.firstName, temporaryPassword)
        .then((result) => {
          console.log('Email sent successfully:', result);
        })
        .catch((error) => {
          console.error('Failed to send credentials email:', error);
        });

      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        throw new ConflictException(
          `A user with this ${target?.join(', ')} already exists`,
        );
      }

      throw new InternalServerErrorException(
        `Failed to create user: ${error.message}`,
      );
    }
  }

  async findAll(filters?: {
    departmentId?: string;
    roleId?: string;
    status?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters?.roleId) {
      where.roleId = filters.roleId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isActive === false) {
      where.isActive = false;
    } else if (filters?.isActive === undefined) {
      where.isActive = true;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { employeeCode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        role: true,
        department: true,
        designation: true,
        level: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        department: true,
        designation: true,
        level: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Find user by email (used for authentication)
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        department: true,
        designation: true,
        level: true,
      },
    });
  }

  /**
   * Find user by employee code
   */
  async findByEmployeeCode(employeeCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { employeeCode },
      include: {
        role: true,
        department: true,
        designation: true,
        level: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Update user details
   */
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if new email already exists
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if employeeCode is being changed and if new code already exists
    if (dto.employeeCode && dto.employeeCode !== user.employeeCode) {
      const existingCode = await this.prisma.user.findUnique({
        where: { employeeCode: dto.employeeCode },
      });

      if (existingCode) {
        throw new ConflictException(
          `Employee code ${dto.employeeCode} already exists`,
        );
      }
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: dto,
        include: {
          role: true,
          department: true,
          designation: true,
          level: true,
        },
      });

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        throw new ConflictException(
          `A user with this ${target?.join(', ')} already exists`,
        );
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /**
   * Change user password (used by user to change their own password)
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update password and activate user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        status: 'ACTIVE', // Activate user after first password change
      },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Reset user password (admin function)
   */
  async resetPassword(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new temporary password
    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Update password and set status back to PENDING
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        status: 'PENDING',
      },
    });

    // Send new credentials email
    this.emailService
      .sendCredentialsEmail(user.email, user.firstName, temporaryPassword)
      .catch((error) => {
        console.error('Failed to send password reset email:', error);
      });

    return {
      message: 'Password reset successfully. New credentials sent to email.',
    };
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivate(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        role: true,
        department: true,
        designation: true,
        level: true,
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Activate user
   */
  async activate(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        role: true,
        department: true,
        designation: true,
        level: true,
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Remove user (soft delete by deactivating)
   */
  async remove(id: string) {
    return this.deactivate(id);
  }

  /**
   * Hard delete user (use with caution)
   */
  async hardDelete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User permanently deleted' };
  }

  /**
   * Get user profile with additional information
   */
  async getProfile(userId: string) {
    const user = await this.findOne(userId);

    // Get leave balance if user has a level
    let leaveBalance: any = null;
    if (user.levelId) {
      leaveBalance = await this.prisma.leaveBalance.findFirst({
        where: {
          userId,
          year: new Date().getFullYear(),
        },
      });
    }

    return {
      ...user,
      leaveBalance,
    };
  }

  /**
   * Get user statistics
   */
  async getStatistics() {
    const [total, active, pending, inactive] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true, status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count({ where: { isActive: false } }),
    ]);

    return {
      total,
      active,
      pending,
      inactive,
    };
  }

  /**
   * Resend credentials email
   */
  async resendCredentials(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new temporary password
    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        status: 'PENDING',
      },
    });

    // Send credentials email
    try {
      await this.emailService.sendCredentialsEmail(
        user.email,
        user.firstName,
        temporaryPassword,
      );
      return { message: 'Credentials sent successfully' };
    } catch (error) {
      console.error('Failed to send credentials email:', error);
      throw new InternalServerErrorException(
        'Failed to send credentials email. Please check email configuration.',
      );
    }
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: any) {
    const { password, passwordResetToken, passwordResetExpiry, ...sanitized } =
      user;
    return sanitized;
  }
}
