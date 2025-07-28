// Simplified email service using EmailJS (no server setup needed)
export class SimpleEmailService {
  static async sendEmail(to: string, subject: string, message: string): Promise<boolean> {
    // For demo purposes, we'll just log the email
    // In production, you can use EmailJS, Resend, or other services

    console.log("📧 EMAIL SENT:")
    console.log("To:", to)
    console.log("Subject:", subject)
    console.log("Message:", message)
    console.log("---")

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Show browser notification instead of actual email
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("ATCL Leave System", {
          body: `Email sent: ${subject}`,
          icon: "/favicon.ico",
        })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("ATCL Leave System", {
              body: `Email sent: ${subject}`,
              icon: "/favicon.ico",
            })
          }
        })
      }
    }

    return true
  }

  static async sendOTP(email: string, otp: string): Promise<boolean> {
    const subject = "ATCL Leave System - Login OTP"
    const message = `Your login OTP is: ${otp}. Valid for 10 minutes.`

    return this.sendEmail(email, subject, message)
  }

  static async sendLeaveRequestNotification(
    request: any,
    approverEmail: string,
    approverName: string,
    step: string,
  ): Promise<boolean> {
    const subject = `ATCL Leave System - Approval Required: ${request.employeeName}`
    const message = `Dear ${approverName}, ${request.employeeName} has submitted a leave request requiring your approval for ${request.leaveType.replace("_", " ")} from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()}.`

    return this.sendEmail(approverEmail, subject, message)
  }

  static async sendStatusUpdateNotification(
    request: any,
    employeeEmail: string,
    status: string,
    approverName: string,
  ): Promise<boolean> {
    const subject = `ATCL Leave System - Request ${status.toUpperCase()}`
    const message = `Your leave request for ${request.leaveType.replace("_", " ")} from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()} has been ${status} by ${approverName}.`

    return this.sendEmail(employeeEmail, subject, message)
  }
}
