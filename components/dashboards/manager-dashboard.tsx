"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLeave } from "@/contexts/leave-context"
import { Clock, CheckCircle, XCircle, Users } from "lucide-react"
import ApprovalInterface from "@/components/approval/approval-interface"
import LeaveHistoryTable from "@/components/tables/leave-history-table"

export default function ManagerDashboard() {
  const { requests, getRequestsForApprover } = useLeave()

  const pendingRequests = getRequestsForApprover("manager")
  const allRequests = requests.filter((r) => r.approvalSteps.some((step) => step.approverRole === "manager"))

  const stats = {
    pending: pendingRequests.length,
    approved: allRequests.filter(
      (r) => r.approvalSteps.find((step) => step.approverRole === "manager")?.status === "approved",
    ).length,
    rejected: allRequests.filter(
      (r) => r.approvalSteps.find((step) => step.approverRole === "manager")?.status === "rejected",
    ).length,
    total: allRequests.length,
  }

  return (
    <DashboardLayout title="Manager Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Approvals ({stats.pending})</TabsTrigger>
            <TabsTrigger value="history">Approval History</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Leave Requests</CardTitle>
                <CardDescription>Review and approve/reject leave requests from your team members</CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovalInterface requests={pendingRequests} approverRole="manager" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
                <CardDescription>View all leave requests you have reviewed</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveHistoryTable requests={allRequests} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
