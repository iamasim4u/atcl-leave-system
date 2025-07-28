"use client"

import { useState } from "react"
import type { LeaveRequest } from "@/contexts/leave-context"
import { useLeave } from "@/contexts/leave-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Eye, Shield, Key } from "lucide-react"

interface ApprovalInterfaceProps {
  requests: LeaveRequest[]
  approverRole: "manager" | "hr" | "coo"
}

export default function ApprovalInterface({ requests, approverRole }: ApprovalInterfaceProps) {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [remarks, setRemarks] = useState("")
  const [otp, setOtp] = useState("")
  const [digitalSignature, setDigitalSignature] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { approveRequest } = useLeave()
  const { user } = useAuth()
  const { toast } = useToast()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleApproval = async (approved: boolean) => {
    if (!selectedRequest || !user) return

    // Find the current step for this approver role
    const currentStep = selectedRequest.approvalSteps.find(
      (step) => step.approverRole === approverRole && step.status === "pending",
    )

    if (!currentStep) {
      toast({
        title: "Error",
        description: "Unable to find approval step",
        variant: "destructive",
      })
      return
    }

    // Validate OTP if provided (simulated validation)
    let otpVerified = false
    if (otp) {
      if (otp === "123456") {
        otpVerified = true
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please enter the correct 6-digit OTP",
          variant: "destructive",
        })
        return
      }
    }

    setIsProcessing(true)

    try {
      // Update the approval step with approver information
      currentStep.approverName = user.name
      currentStep.approverId = user.id

      approveRequest(selectedRequest.id, currentStep.id, approved, remarks, otpVerified)

      toast({
        title: approved ? "Request Approved" : "Request Rejected",
        description: `Leave request has been ${approved ? "approved" : "rejected"} successfully`,
      })

      // Reset form
      setSelectedRequest(null)
      setRemarks("")
      setOtp("")
      setDigitalSignature(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process approval. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No pending requests for approval.</p>
        <p className="text-sm">All caught up! 🎉</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="border-l-4 border-l-yellow-400">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {request.employeeName} - {request.department}
                </CardTitle>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span className="capitalize">{request.leaveType.replace("_", " ")}</span>
                  <span>
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </span>
                  <span>{request.duration} days</span>
                  <Badge className="status-pending">Pending</Badge>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Review Leave Request</DialogTitle>
                  </DialogHeader>
                  {selectedRequest && (
                    <div className="space-y-6">
                      {/* Request Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Request Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Employee</p>
                            <p>{selectedRequest.employeeName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Department</p>
                            <p>{selectedRequest.department}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Leave Type</p>
                            <p className="capitalize">{selectedRequest.leaveType.replace("_", " ")}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Duration</p>
                            <p>{selectedRequest.duration} days</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Start Date</p>
                            <p>{formatDate(selectedRequest.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">End Date</p>
                            <p>{formatDate(selectedRequest.endDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Exit/Re-entry Visa</p>
                            <p>{selectedRequest.exitReentryVisa ? "Required" : "Not Required"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Submitted</p>
                            <p>{formatDate(selectedRequest.submittedAt)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-medium">Reason</p>
                            <p className="mt-1">{selectedRequest.reason}</p>
                          </div>
                          {selectedRequest.emergencyContact.name && (
                            <div className="col-span-2">
                              <p className="text-sm font-medium">Emergency Contact</p>
                              <p className="mt-1">
                                {selectedRequest.emergencyContact.name} - {selectedRequest.emergencyContact.phone}
                                {selectedRequest.emergencyContact.relationship &&
                                  ` (${selectedRequest.emergencyContact.relationship})`}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Approval Form */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Approval Decision
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                            <Textarea
                              id="remarks"
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder="Add any comments or remarks about this request"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="otp">6-Digit OTP (Optional)</Label>
                            <Input
                              id="otp"
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="Enter 6-digit OTP (demo: 123456)"
                              maxLength={6}
                              className="font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              <Key className="w-3 h-3 inline mr-1" />
                              For demo purposes, use: 123456
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="digitalSignature"
                              checked={digitalSignature}
                              onCheckedChange={(checked) => setDigitalSignature(checked as boolean)}
                            />
                            <Label htmlFor="digitalSignature">I digitally sign this approval decision</Label>
                          </div>

                          <div className="flex justify-end space-x-4 pt-4">
                            <Button variant="destructive" onClick={() => handleApproval(false)} disabled={isProcessing}>
                              <XCircle className="w-4 h-4 mr-2" />
                              {isProcessing ? "Processing..." : "Reject"}
                            </Button>
                            <Button
                              onClick={() => handleApproval(true)}
                              disabled={isProcessing}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {isProcessing ? "Processing..." : "Approve"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>
                <strong>Reason:</strong> {request.reason}
              </p>
              {request.exitReentryVisa && (
                <p className="mt-1 text-orange-600">
                  <strong>Note:</strong> Exit/Re-entry visa required
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
