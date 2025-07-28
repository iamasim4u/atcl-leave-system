// Mock email service for demonstration
// In production, this would integrate with services like Resend, SendGrid, or AWS SES

export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export class EmailService {
  private static readonly SMTP_CONFIG = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "noreply@atcl.sa",
      pass: process.env.SMTP_PASS || "your-app-password",
    },
  }

  static async sendOTP(email: string, otp: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: "ATCL Leave System - Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #374151 100%); color: white; padding: 20px; text-align: center;">
            <h1>ATCL Leave System</h1>
            <p>Aspiring Technologies Company Limited</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1e40af;">Login Verification Code</h2>
            <p>Your One-Time Password (OTP) for ATCL Leave System login is:</p>
            
            <div style="background: #1e40af; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
              ${otp}
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this, please contact IT support</li>
            </ul>
            
            <p>Best regards,<br>ATCL IT Support Team</p>
          </div>
          
          <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
            © ATCL Leave System | Powered by Aspiring Technologies
          </div>
        </div>
      `,
    }

    // Simulate email sending (in production, use actual email service)
    console.log("📧 Email sent to:", email)
    console.log("🔐 OTP:", otp)
    console.log("📄 Email content:", template.html)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return true
  }

  static async sendLeaveRequestNotification(
    request: any,
    approverEmail: string,
    approverName: string,
    step: string,
  ): Promise<boolean> {
    const template: EmailTemplate = {
      to: approverEmail,
      subject: `ATCL Leave System - Approval Required: ${request.employeeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #374151 100%); color: white; padding: 20px; text-align: center;">
            <h1>ATCL Leave System</h1>
            <p>Aspiring Technologies Company Limited</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1e40af;">Leave Request Approval Required</h2>
            <p>Dear ${approverName},</p>
            <p>A leave request requires your approval:</p>
            
            <div style="background: white; padding: 20px; border-left: 4px solid #1e40af; margin: 20px 0;">
              <h3>${request.employeeName} - ${request.department}</h3>
              <p><strong>Leave Type:</strong> ${request.leaveType.replace("_", " ").toUpperCase()}</p>
              <p><strong>Duration:</strong> ${request.startDate.toLocaleDateString()} - ${request.endDate.toLocaleDateString()} (${request.duration} days)</p>
              <p><strong>Reason:</strong> ${request.reason}</p>
              <p><strong>Approval Step:</strong> ${step}</p>
            </div>
            
            <p>Please log in to the ATCL Leave System to review and approve this request.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" 
                 style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Request
              </a>
            </div>
            
            <p>Best regards,<br>ATCL Leave Management System</p>
          </div>
          
          <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
            © ATCL Leave System | Powered by Aspiring Technologies
          </div>
        </div>
      `,
    }

    console.log("📧 Approval notification sent to:", approverEmail)
    console.log("📄 Email content:", template.html)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }

  static async sendStatusUpdateNotification(
    request: any,
    employeeEmail: string,
    status: string,
    approverName: string,
  ): Promise<boolean> {
    const isApproved = status === "approved"
    const template: EmailTemplate = {
      to: employeeEmail,
      subject: `ATCL Leave System - Request ${status.toUpperCase()}: ${request.leaveType.replace("_", " ")} Leave`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #374151 100%); color: white; padding: 20px; text-align: center;">
            <h1>ATCL Leave System</h1>
            <p>Aspiring Technologies Company Limited</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: ${isApproved ? "#059669" : "#dc2626"};">
              Leave Request ${status.toUpperCase()}
            </h2>
            <p>Dear ${request.employeeName},</p>
            <p>Your leave request has been <strong>${status}</strong> by ${approverName}.</p>
            
            <div style="background: white; padding: 20px; border-left: 4px solid ${isApproved ? "#059669" : "#dc2626"}; margin: 20px 0;">
              <h3>Request Details</h3>
              <p><strong>Leave Type:</strong> ${request.leaveType.replace("_", " ").toUpperCase()}</p>
              <p><strong>Duration:</strong> ${request.startDate.toLocaleDateString()} - ${request.endDate.toLocaleDateString()} (${request.duration} days)</p>
              <p><strong>Status:</strong> ${status.toUpperCase()}</p>
            </div>
            
            ${
              isApproved
                ? "<p>🎉 Your leave has been approved! You can download the official approval certificate from your dashboard.</p>"
                : "<p>❌ Your leave request has been rejected. Please contact your manager or HR for more information.</p>"
            }
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" 
                 style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Dashboard
              </a>
            </div>
            
            <p>Best regards,<br>ATCL Leave Management System</p>
          </div>
          
          <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
            © ATCL Leave System | Powered by Aspiring Technologies
          </div>
        </div>
      `,
    }

    console.log("📧 Status update sent to:", employeeEmail)
    console.log("📄 Email content:", template.html)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    return true
  }
}
