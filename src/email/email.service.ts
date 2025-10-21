import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('RESEND_API_KEY');
    if (!apiKey) {
      console.error(
        'RESEND_API_KEY is not configured in environment variables',
      );
    }
    this.resend = new Resend(apiKey);
  }

  async sendWelcomeCandidateEmail(
    email: string,
    firstName: string,
    position: string,
  ) {
    try {
      const result = await this.resend.emails.send({
        from: 'Femi Company <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to Femi Company - Application Received',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
                margin: -30px -30px 30px -30px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                font-size: 13px;
                color: #6c757d;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <div class="header">
                  <h1 style="margin: 0;">Application Received</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for applying!</p>
                </div>
                
                <p>Dear <strong>${firstName}</strong>,</p>
                
                <p>Thank you for applying for the position of <strong>${position}</strong> at Femi Company. We are excited to review your application!</p>
                
                <p>Our HR team will carefully review your application and qualifications. If your profile matches our requirements, we will contact you to discuss the next steps in the recruitment process.</p>
                
                <p>Here's what you can expect:</p>
                <ul>
                  <li>Initial application review (1-2 business days)</li>
                  <li>Possible screening call with HR</li>
                  <li>Technical/role-specific interviews</li>
                  <li>Final decision and offer process</li>
                </ul>
                
                <p>We appreciate your interest in joining our team and the time you've taken to apply.</p>
                
                <p>Best regards,<br><strong>The HR Team</strong><br>Femi Company</p>
                
                <div class="footer">
                  <p>This is an automated email. Please do not reply to this message.</p>
                  <p>© ${new Date().getFullYear()} Femi Company. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('Welcome candidate email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send welcome candidate email:', error);
      throw error;
    }
  }

  async sendCredentialsEmail(
    email: string,
    firstName: string,
    temporaryPassword: string,
  ) {
    const appUrl = this.configService.get('APP_URL') || 'http://localhost:5173';
    const loginLink = `${appUrl}`;

    try {
      const result = await this.resend.emails.send({
        from: 'Femi Company <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to Femi Comapny - Your Login Credentials',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
                margin: -30px -30px 30px -30px;
              }
              .credentials-box {
                background-color: #f8f9fa;
                padding: 20px;
                margin: 25px 0;
                border-left: 4px solid #667eea;
                border-radius: 4px;
              }
              .credential-item {
                margin: 10px 0;
              }
              .credential-label {
                font-weight: bold;
                color: #495057;
              }
              .credential-value {
                color: #212529;
                font-family: monospace;
                font-size: 16px;
                padding: 8px;
                background: white;
                border-radius: 4px;
                display: inline-block;
                margin-top: 5px;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: bold;
              }
              .warning-box {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                font-size: 13px;
                color: #6c757d;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="content">
                <div class="header">
                  <h1 style="margin: 0;">Welcome to HR System!</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been created</p>
                </div>
                
                <p>Hi <strong>${firstName}</strong>,</p>
                
                <p>Your account has been successfully created. Please use the following credentials to log in:</p>
                
                <div class="credentials-box">
                  <div class="credential-item">
                    <div class="credential-label">Email:</div>
                    <div class="credential-value">${email}</div>
                  </div>
                  <div class="credential-item">
                    <div class="credential-label">Temporary Password:</div>
                    <div class="credential-value">${temporaryPassword}</div>
                  </div>
                </div>
                
                <div class="warning-box">
                  <strong>⚠️ Important:</strong> For security reasons, you must change your password immediately after your first login.
                </div>
                
                <center>
                  <a href="${loginLink}" class="button">Login Now</a>
                </center>
                
                <p style="margin-top: 30px;">If you have any questions or need assistance, please contact your administrator.</p>
                
                <p>Best regards,<br><strong>The HR Team</strong></p>
                
                <div class="footer">
                  <p>This is an automated email. Please do not reply to this message.</p>
                  <p>© ${new Date().getFullYear()} HR System. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('Credentials email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send credentials email:', error);
      throw error;
    }
  }

  async sendOfferEmail(
    email: string,
    candidateName: string,
    position: string,
    acceptanceToken: string | null,
    p0: {
      position: string;
      department: string | null;
      salary: number;
      startDate: Date | null;
      expiresAt: Date | null;
    },
  ) {
    const appUrl = this.configService.get('APP_URL') || 'http://localhost:5173';
    const acceptanceLink = `${appUrl}/accept-offer/${acceptanceToken}`;

    try {
      const result = await this.resend.emails.send({
        from: 'HR System <onboarding@resend.dev>',
        to: email,
        subject: `Job Offer - ${position}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
              .content { background: white; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .button { display: inline-block; padding: 14px 32px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
              .info-box { background: #f0f7ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎉 Congratulations!</h1>
              </div>
              <div class="content">
                <h2>Dear ${candidateName},</h2>
                <p>We are delighted to offer you the position of <strong>${position}</strong> at our company!</p>
                <div class="info-box">
                  <p>Please review the offer details and accept by clicking the button below:</p>
                </div>
                <center>
                  <a href="${acceptanceLink}" class="button">Accept Offer</a>
                </center>
                <p style="color: #666; font-size: 14px;">⏰ This link will expire in 7 days.</p>
                <p>We look forward to welcoming you to our team!</p>
                <p>Best regards,<br><strong>The HR Team</strong></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('Offer email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send offer email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const appUrl = this.configService.get('APP_URL') || 'http://localhost:5173';
    const resetLink = `${appUrl}/reset-password/${resetToken}`;

    try {
      const result = await this.resend.emails.send({
        from: 'HR System <onboarding@resend.dev>',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #FF5722; color: white; padding: 30px; text-align: center; border-radius: 8px; }
              .content { background: white; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .button { display: inline-block; padding: 14px 32px; background: #FF5722; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🔒 Password Reset</h1>
              </div>
              <div class="content">
                <p>You requested to reset your password. Click the button below to proceed:</p>
                <center>
                  <a href="${resetLink}" class="button">Reset Password</a>
                </center>
                <div class="warning">
                  <strong>⏰ Note:</strong> This link will expire in 1 hour for security reasons.
                </div>
                <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                <p>Best regards,<br><strong>The HR Team</strong></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('Password reset email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendLeaveApprovalNotification(
    email: string,
    employeeName: string,
    status: string,
    reason?: string,
  ) {
    const statusColors = {
      APPROVED: '#4CAF50',
      REJECTED: '#f44336',
      PENDING: '#ff9800',
    };
    const statusColor = statusColors[status] || '#2196F3';

    try {
      const result = await this.resend.emails.send({
        from: 'Femi Company <onboarding@resend.dev>',
        to: email,
        subject: `Leave Application ${status}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; border-radius: 8px; }
              .content { background: white; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .status-badge { display: inline-block; padding: 8px 16px; background: ${statusColor}; color: white; border-radius: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Leave Application Update</h1>
              </div>
              <div class="content">
                <p>Dear <strong>${employeeName}</strong>,</p>
                <p>Your leave application has been:</p>
                <center>
                  <span class="status-badge">${status}</span>
                </center>
                ${reason ? `<p style="margin-top: 20px;"><strong>Reason:</strong> ${reason}</p>` : ''}
                <p style="margin-top: 30px;">If you have any questions, please contact your supervisor or HR department.</p>
                <p>Best regards,<br><strong>The HR Team</strong></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log('Leave notification email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send leave notification email:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const result = await this.resend.emails.send({
        from: 'HR System <onboarding@resend.dev>',
        to: 'delivered@resend.dev',
        subject: 'Test Email - HR System',
        html: '<p>This is a test email to verify Resend configuration.</p>',
      });
      console.log('Email service is working correctly:', result);
      return true;
    } catch (error) {
      console.error('Email service test failed:', error);
      return false;
    }
  }
}
