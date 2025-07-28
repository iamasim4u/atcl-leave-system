"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { SimpleEmailService } from "@/lib/email-service-simple"
import { useAuth } from "./auth-context" // Import useAuth to get user details

export type LeaveType = "annual" | "sick" | "emergency" | "maternity" | "hajj" | "unpaid"
export type ApprovalStatus = "pending" | "approved" | "rejected"

export interface ApprovalStep {
  id: string
  step: number
  approverRole: "manager" | "hr" | "coo"
  approverName?: string
  approverId?: string // Added approverId to link to specific user
  status: ApprovalStatus
  timestamp?: Date
  remarks?: string
  digitalSignature?: boolean
  otpVerified?: boolean
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  department: string
  leaveType: LeaveType
  startDate: Date
  endDate: Date
  duration: number
  exitReentryVisa: boolean
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  reason: string
  approvalSteps: ApprovalStep[]
  currentStep: number
  finalStatus: ApprovalStatus
  submittedAt: Date
  pdfGenerated?: boolean
}

interface LeaveContextType {
  requests: LeaveRequest[]
  submitRequest: (
    request: Omit<LeaveRequest, "id" | "submittedAt" | "approvalSteps" | "currentStep" | "finalStatus">,
  ) => void
  approveRequest: (
    requestId: string,
    stepId: string,
    approved: boolean,
    remarks?: string,
    otpVerified?: boolean,
  ) => void
  getRequestsForApprover: (role: string, approverId?: string) => LeaveRequest[] // Added approverId
  getRequestsByEmployee: (employeeId: string) => LeaveRequest[]
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined)

export function LeaveProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const { getUserById, users } = useAuth() // Use useAuth to get user details

  const submitRequest = (
    requestData: Omit<LeaveRequest, "id" | "submittedAt" | "approvalSteps" | "currentStep" | "finalStatus">,
  ) => {
    const employee = getUserById(requestData.employeeId)
    const manager = employee?.managerId ? getUserById(employee.managerId) : undefined

    if (!manager) {
      console.error("Manager not found for employee:", employee?.name)
      // Fallback to a default manager or handle error
      // For demo, we'll proceed but in real app, this needs proper error handling
    }

    const newRequest: LeaveRequest = {
      ...requestData,
      id: `req_${Date.now()}`,
      submittedAt: new Date(),
      currentStep: 1,
      finalStatus: "pending",
      approvalSteps: [
        {
          id: `step_1_${Date.now()}`,
          step: 1,
          approverRole: "manager",
          approverId: manager?.id, // Assign specific manager ID
          status: "pending",
        },
        {
          id: `step_2_${Date.now()}`,
          step: 2,
          approverRole: "hr",
          approverId: users.find((u) => u.role === "hr")?.id, // Assign generic HR for now
          status: "pending",
        },
        {
          id: `step_3_${Date.now()}`,
          step: 3,
          approverRole: "coo",
          approverId: users.find((u) => u.role === "coo")?.id, // Assign generic COO for now
          status: "pending",
        },
      ],
    }

    setRequests((prev) => [...prev, newRequest])

    // Send notification to the specific manager
    if (manager) {
      SimpleEmailService.sendLeaveRequestNotification(newRequest, manager.email, manager.name, "Manager Approval")
    } else {
      console.warn("No manager found for notification. Email not sent.")
    }
  }

  const approveRequest = (
    requestId: string,
    stepId: string,
    approved: boolean,
    remarks?: string,
    otpVerified?: boolean,
  ) => {
    setRequests((prev) =>
      prev.map((request) => {
        if (request.id !== requestId) return request

        const currentApprover = getUserById(request.approvalSteps.find((s) => s.id === stepId)?.approverId || "")
        const employee = getUserById(request.employeeId)

        const updatedSteps = request.approvalSteps.map((step) => {
          if (step.id === stepId) {
            return {
              ...step,
              status: approved ? ("approved" as ApprovalStatus) : ("rejected" as ApprovalStatus),
              timestamp: new Date(),
              remarks,
              otpVerified,
              digitalSignature: true,
              approverName: currentApprover?.name || step.approverRole.toUpperCase(), // Set approver name
            }
          }
          return step
        })

        let newCurrentStep = request.currentStep
        let newFinalStatus = request.finalStatus

        if (!approved) {
          newFinalStatus = "rejected"
          if (employee) {
            SimpleEmailService.sendStatusUpdateNotification(
              request,
              employee.email,
              "rejected",
              currentApprover?.name || "Approver",
            )
          }
        } else if (request.currentStep < 3) {
          newCurrentStep = request.currentStep + 1
          const nextStepData = updatedSteps.find((step) => step.step === newCurrentStep)
          if (nextStepData && nextStepData.approverId) {
            const nextApprover = getUserById(nextStepData.approverId)
            if (nextApprover) {
              SimpleEmailService.sendLeaveRequestNotification(
                request,
                nextApprover.email,
                nextApprover.name,
                `${nextApprover.role.toUpperCase()} Approval`,
              )
            }
          }
        } else {
          newFinalStatus = "approved"
          if (employee) {
            SimpleEmailService.sendStatusUpdateNotification(
              request,
              employee.email,
              "approved",
              currentApprover?.name || "COO",
            )
          }
        }

        return {
          ...request,
          approvalSteps: updatedSteps,
          currentStep: newCurrentStep,
          finalStatus: newFinalStatus,
          pdfGenerated: newFinalStatus !== "pending",
        }
      }),
    )
  }

  const getRequestsForApprover = (role: string, approverId?: string) => {
    return requests.filter((request) => {
      const currentStepData = request.approvalSteps.find((step) => step.step === request.currentStep)
      // For managers, filter by specific approverId
      if (role === "manager" && approverId) {
        return (
          currentStepData?.approverRole === role &&
          currentStepData?.approverId === approverId &&
          currentStepData?.status === "pending"
        )
      }
      // For HR/COO, filter by role (they see all for their role)
      return currentStepData?.approverRole === role && currentStepData?.status === "pending"
    })
  }

  const getRequestsByEmployee = (employeeId: string) => {
    return requests.filter((request) => request.employeeId === employeeId)
  }

  return (
    <LeaveContext.Provider
      value={{
        requests,
        submitRequest,
        approveRequest,
        getRequestsForApprover,
        getRequestsByEmployee,
      }}
    >
      {children}
    </LeaveContext.Provider>
  )
}

export function useLeave() {
  const context = useContext(LeaveContext)
  if (context === undefined) {
    throw new Error("useLeave must be used within a LeaveProvider")
  }
  return context
}
