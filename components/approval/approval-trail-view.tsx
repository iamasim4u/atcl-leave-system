"use client"

import type { LeaveRequest } from "@/contexts/leave-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Shield } from "lucide-react"

interface ApprovalTrailViewProps {
  request: LeaveRequest
}

export default function ApprovalTrailView({ request }: ApprovalTrailViewProps) {
  const getStepIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="status-pending">Pending</Badge>
      case "approved":
        return <Badge className="status-approved">Approved</Badge>
      case "rejected":
        return <Badge className="status-rejected">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDateTime = (date?: Date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleString("en-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Approval Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {request.approvalSteps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">{getStepIcon(step.status)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium capitalize">
                      Step {step.step}: {step.approverRole} Approval
                    </h4>
                    {step.approverName && <p className="text-sm text-gray-600">{step.approverName}</p>}
                  </div>
                  {getStatusBadge(step.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Timestamp:</span>
                    <p className="text-gray-600">{formatDateTime(step.timestamp)}</p>
                  </div>

                  {step.digitalSignature && (
                    <div>
                      <span className="font-medium">Digital Signature:</span>
                      <p className="text-green-600">✓ Verified</p>
                    </div>
                  )}

                  {step.otpVerified && (
                    <div>
                      <span className="font-medium">OTP Verification:</span>
                      <p className="text-green-600">✓ Verified</p>
                    </div>
                  )}

                  {step.remarks && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Remarks:</span>
                      <p className="text-gray-600 mt-1">{step.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
