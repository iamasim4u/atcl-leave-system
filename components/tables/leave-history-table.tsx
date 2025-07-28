"use client"

import type { LeaveRequest } from "@/contexts/leave-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Download } from "lucide-react"
import { useState } from "react"
import ApprovalTrailView from "@/components/approval/approval-trail-view"
import { PDFGenerator } from "@/lib/pdf-generator"
import { useToast } from "@/hooks/use-toast"

interface LeaveHistoryTableProps {
  requests: LeaveRequest[]
}

export default function LeaveHistoryTable({ requests }: LeaveHistoryTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const { toast } = useToast()

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const generatePDF = async (request: LeaveRequest) => {
    try {
      await PDFGenerator.downloadPDF(request)
      toast({
        title: "PDF Downloaded",
        description: "Leave request certificate has been downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No leave requests found.</p>
        <p className="text-sm">Submit your first leave request to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-mono text-sm">{request.id.slice(-8)}</TableCell>
              <TableCell className="capitalize">{request.leaveType.replace("_", " ")}</TableCell>
              <TableCell>{formatDate(request.startDate)}</TableCell>
              <TableCell>{formatDate(request.endDate)}</TableCell>
              <TableCell>{request.duration} days</TableCell>
              <TableCell>{getStatusBadge(request.finalStatus)}</TableCell>
              <TableCell>{formatDate(request.submittedAt)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Leave Request Details</DialogTitle>
                      </DialogHeader>
                      {selectedRequest && (
                        <div className="space-y-6">
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
                              <div className="col-span-2">
                                <p className="text-sm font-medium">Reason</p>
                                <p>{selectedRequest.reason}</p>
                              </div>
                            </CardContent>
                          </Card>

                          <ApprovalTrailView request={selectedRequest} />
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {request.finalStatus !== "pending" && (
                    <Button variant="outline" size="sm" onClick={() => generatePDF(request)}>
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
