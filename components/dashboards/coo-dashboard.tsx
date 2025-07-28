"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useLeave } from "@/contexts/leave-context"
import { Clock, CheckCircle, XCircle, Users, TrendingUp, Download } from "lucide-react"
import ApprovalInterface from "@/components/approval/approval-interface"
import LeaveHistoryTable from "@/components/tables/leave-history-table"

export default function COODashboard() {
  const { requests, getRequestsForApprover } = useLeave()

  const pendingRequests = getRequestsForApprover("coo")
  const allRequests = requests.filter((r) => r.approvalSteps.some((step) => step.approverRole === "coo"))

  const stats = {
    pending: pendingRequests.length,
    approved: allRequests.filter(
      (r) => r.approvalSteps.find((step) => step.approverRole === "coo")?.status === "approved",
    ).length,
    rejected: allRequests.filter(
      (r) => r.approvalSteps.find((step) => step.approverRole === "coo")?.status === "rejected",
    ).length,
    total: requests.length,
    totalApproved: requests.filter((r) => r.finalStatus === "approved").length,
  }

  const generateExecutiveReport = () => {
    // In a real app, this would generate a comprehensive PDF report
    const reportData = {
      totalRequests: requests.length,
      approvedRequests: requests.filter((r) => r.finalStatus === "approved").length,
      rejectedRequests: requests.filter((r) => r.finalStatus === "rejected").length,
      pendingRequests: requests.filter((r) => r.finalStatus === "pending").length,
      departmentBreakdown: requests.reduce(
        (acc, req) => {
          acc[req.department] = (acc[req.department] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      leaveTypeBreakdown: requests.reduce(
        (acc, req) => {
          acc[req.leaveType] = (acc[req.leaveType] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    console.log("Executive Report Data:", reportData)
    alert("Executive report generated! Check console for data.")
  }

  return (
    <DashboardLayout title="COO Executive Dashboard">
      <div className="space-y-6">
        {/* Executive Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Final Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved by COO</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected by COO</CardTitle>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total > 0 ? Math.round((stats.totalApproved / stats.total) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="pending">Final Approvals ({stats.pending})</TabsTrigger>
              <TabsTrigger value="overview">Executive Overview</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <Button onClick={generateExecutiveReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Executive Report
            </Button>
          </div>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Requests Requiring Final Approval</CardTitle>
                <CardDescription>
                  Leave requests that have passed manager and HR approval, awaiting COO final approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApprovalInterface requests={pendingRequests} approverRole="coo" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      requests.reduce(
                        (acc, req) => {
                          acc[req.department] = (acc[req.department] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([dept, count]) => (
                      <div key={dept} className="flex justify-between items-center">
                        <span className="text-sm">{dept}</span>
                        <span className="font-medium">{count} requests</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leave Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      requests.reduce(
                        (acc, req) => {
                          acc[req.leaveType] = (acc[req.leaveType] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{type.replace("_", " ")}</span>
                        <span className="font-medium">{count} requests</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Leave Requests - Executive View</CardTitle>
                <CardDescription>Complete overview of all leave requests across the organization</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveHistoryTable requests={requests} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
