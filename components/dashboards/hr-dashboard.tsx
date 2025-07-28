"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useLeave } from "@/contexts/leave-context"
import { Clock, CheckCircle, XCircle, Users, Download, Settings } from "lucide-react"
import ApprovalInterface from "@/components/approval/approval-interface"
import LeaveHistoryTable from "@/components/tables/leave-history-table"
import AdminPanel from "@/components/admin/admin-panel"

export default function HRDashboard() {
  const { requests, getRequestsForApprover } = useLeave()

  const pendingRequests = getRequestsForApprover("hr")
  const allRequests = requests.filter((r) => r.approvalSteps.some((step) => step.approverRole === "hr"))

  const stats = {
    pending: pendingRequests.length,
    approved: allRequests.filter(
      (r) => r.approvalSteps.find((step) => step.approverRole === "hr")?.status === "approved",
    ).length,
    rejected: allRequests.filter(
      (r) => r.approvalSteps.find((step) => step.approverRole === "hr")?.status === "rejected",
    ).length,
    total: requests.length,
  }

  const exportToCSV = () => {
    const csvData = requests.map((request) => ({
      "Request ID": request.id,
      "Employee Name": request.employeeName,
      Department: request.department,
      "Leave Type": request.leaveType,
      "Start Date": request.startDate.toISOString().split("T")[0],
      "End Date": request.endDate.toISOString().split("T")[0],
      Duration: request.duration,
      Status: request.finalStatus,
      Submitted: request.submittedAt.toISOString().split("T")[0],
    }))

    const csvContent = [Object.keys(csvData[0]).join(","), ...csvData.map((row) => Object.values(row).join(","))].join(
      "\n",
    )

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leave_requests_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout title="HR Dashboard">
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
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="pending">Pending Approvals ({stats.pending})</TabsTrigger>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="admin">Admin Panel</TabsTrigger>
            </TabsList>

            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Leave Requests</CardTitle>
                <CardDescription>Review and approve/reject leave requests requiring HR approval</CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovalInterface requests={pendingRequests} approverRole="hr" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Leave Requests</CardTitle>
                <CardDescription>Complete overview of all leave requests in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveHistoryTable requests={requests} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Administration
                </CardTitle>
                <CardDescription>Manage leave policies, quotas, and system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
