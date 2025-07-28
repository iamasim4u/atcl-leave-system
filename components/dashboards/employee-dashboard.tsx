"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useLeave } from "@/contexts/leave-context"
import LeaveRequestForm from "@/components/forms/leave-request-form"
import LeaveHistoryTable from "@/components/tables/leave-history-table"
import { Plus, Calendar, Clock, CheckCircle, XCircle } from "lucide-react"

export default function EmployeeDashboard() {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const { user } = useAuth()
  const { getRequestsByEmployee } = useLeave()

  const userRequests = user ? getRequestsByEmployee(user.id) : []

  const stats = {
    total: userRequests.length,
    pending: userRequests.filter((r) => r.finalStatus === "pending").length,
    approved: userRequests.filter((r) => r.finalStatus === "approved").length,
    rejected: userRequests.filter((r) => r.finalStatus === "rejected").length,
  }

  return (
    <DashboardLayout title="Employee Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
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
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="requests">My Requests</TabsTrigger>
              <TabsTrigger value="new">New Request</TabsTrigger>
            </TabsList>

            <Button onClick={() => setShowRequestForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Leave Request
            </Button>
          </div>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Leave Request History</CardTitle>
                <CardDescription>View all your leave requests and their approval status</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveHistoryTable requests={userRequests} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Submit New Leave Request</CardTitle>
                <CardDescription>Fill out the form below to submit a new leave request</CardDescription>
              </CardHeader>
              <CardContent>
                <LeaveRequestForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Leave Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">New Leave Request</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowRequestForm(false)}>
                    Close
                  </Button>
                </div>
                <LeaveRequestForm onSuccess={() => setShowRequestForm(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
