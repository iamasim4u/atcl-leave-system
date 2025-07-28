import jsPDF from "jspdf"
import type { LeaveRequest } from "@/contexts/leave-context"

export class PDFGenerator {
  static async generateLeaveRequestPDF(request: LeaveRequest): Promise<Blob> {
    const pdf = new jsPDF("p", "mm", "a4")

    // ATCL Header
    pdf.setFillColor(30, 64, 175) // Blue color
    pdf.rect(0, 0, 210, 30, "F")

    // Company Logo and Name
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.text("ATCL", 20, 20)

    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text("Aspiring Technologies Company Limited", 20, 25)

    // Document Title
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("LEAVE REQUEST APPROVAL CERTIFICATE", 20, 45)

    // Request Details
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    let yPos = 60
    const lineHeight = 6

    // Employee Information
    pdf.setFont("helvetica", "bold")
    pdf.text("EMPLOYEE INFORMATION", 20, yPos)
    yPos += lineHeight

    pdf.setFont("helvetica", "normal")
    pdf.text(`Employee Name: ${request.employeeName}`, 20, yPos)
    yPos += lineHeight
    pdf.text(`Department: ${request.department}`, 20, yPos)
    yPos += lineHeight
    pdf.text(`Employee ID: ${request.employeeId}`, 20, yPos)
    yPos += lineHeight * 2

    // Leave Details
    pdf.setFont("helvetica", "bold")
    pdf.text("LEAVE DETAILS", 20, yPos)
    yPos += lineHeight

    pdf.setFont("helvetica", "normal")
    pdf.text(`Leave Type: ${request.leaveType.toUpperCase().replace("_", " ")}`, 20, yPos)
    yPos += lineHeight
    pdf.text(`Start Date: ${request.startDate.toLocaleDateString("en-SA")}`, 20, yPos)
    yPos += lineHeight
    pdf.text(`End Date: ${request.endDate.toLocaleDateString("en-SA")}`, 20, yPos)
    yPos += lineHeight
    pdf.text(`Duration: ${request.duration} days`, 20, yPos)
    yPos += lineHeight
    pdf.text(`Exit/Re-entry Visa: ${request.exitReentryVisa ? "Required" : "Not Required"}`, 20, yPos)
    yPos += lineHeight
    pdf.text(`Reason: ${request.reason}`, 20, yPos)
    yPos += lineHeight * 2

    // Emergency Contact
    if (request.emergencyContact.name) {
      pdf.setFont("helvetica", "bold")
      pdf.text("EMERGENCY CONTACT", 20, yPos)
      yPos += lineHeight

      pdf.setFont("helvetica", "normal")
      pdf.text(`Name: ${request.emergencyContact.name}`, 20, yPos)
      yPos += lineHeight
      pdf.text(`Phone: ${request.emergencyContact.phone}`, 20, yPos)
      yPos += lineHeight
      pdf.text(`Relationship: ${request.emergencyContact.relationship}`, 20, yPos)
      yPos += lineHeight * 2
    }

    // Approval Trail
    pdf.setFont("helvetica", "bold")
    pdf.text("APPROVAL TRAIL", 20, yPos)
    yPos += lineHeight

    request.approvalSteps.forEach((step, index) => {
      pdf.setFont("helvetica", "normal")
      const stepTitle = `${step.step}. ${step.approverRole.toUpperCase()} APPROVAL`
      pdf.text(stepTitle, 20, yPos)
      yPos += lineHeight

      if (step.approverName) {
        pdf.text(`   Approver: ${step.approverName}`, 20, yPos)
        yPos += lineHeight
      }

      pdf.text(`   Status: ${step.status.toUpperCase()}`, 20, yPos)
      yPos += lineHeight

      if (step.timestamp) {
        pdf.text(`   Date: ${step.timestamp.toLocaleString("en-SA")}`, 20, yPos)
        yPos += lineHeight
      }

      if (step.remarks) {
        pdf.text(`   Remarks: ${step.remarks}`, 20, yPos)
        yPos += lineHeight
      }

      if (step.digitalSignature) {
        pdf.text(`   Digital Signature: ✓ Verified`, 20, yPos)
        yPos += lineHeight
      }

      if (step.otpVerified) {
        pdf.text(`   OTP Verification: ✓ Verified`, 20, yPos)
        yPos += lineHeight
      }

      yPos += lineHeight
    })

    // Final Status
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(12)
    const statusColor = request.finalStatus === "approved" ? [0, 128, 0] : [255, 0, 0]
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2])
    pdf.text(`FINAL STATUS: ${request.finalStatus.toUpperCase()}`, 20, yPos)

    // Footer
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.text("This document is digitally generated and certified by ATCL Leave Management System", 20, 280)
    pdf.text("© ATCL Leave System | Powered by Aspiring Technologies", 20, 285)
    pdf.text(`Generated on: ${new Date().toLocaleString("en-SA")}`, 20, 290)

    return pdf.output("blob")
  }

  static async downloadPDF(request: LeaveRequest) {
    const pdfBlob = await this.generateLeaveRequestPDF(request)
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `ATCL_Leave_Request_${request.id}_${request.employeeName.replace(/\s+/g, "_")}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
