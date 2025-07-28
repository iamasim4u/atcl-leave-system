"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Save } from "lucide-react"
import UserManagement from "./user-management"

export default function AdminPanel() {
  const { toast } = useToast()

  const [leaveQuotas, setLeaveQuotas] = useState({
    annual: 30,
    sick: 15,
    emergency: 5,
    maternity: 90,
    hajj: 21,
    unpaid: 30,
  })

  const [holidays, setHolidays] = useState([
    { id: 1, name: "New Year's Day", date: "2024-01-01", type: "National" },
    { id: 2, name: "Saudi National Day", date: "2024-09-23", type: "National" },
    { id: 3, name: "Eid Al-Fitr", date: "2024-04-10", type: "Religious" },
    { id: 4, name: "Eid Al-Adha", date: "2024-06-16", type: "Religious" },
  ])

  const [users] = useState([
    { id: "1", name: "John Doe", role: "employee", department: "Software Development", status: "active" },
    { id: "2", name: "Sarah Al-Rashid", role: "manager", department: "Software Development", status: "active" },
    { id: "3", name: "Ahmed Al-Mahmoud", role: "hr", department: "Human Resources", status: "active" },
    { id: "4", name: "Fatima Al-Zahra", role: "coo", department: "Executive", status: "active" },
  ])

  const handleSaveQuotas = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Settings Saved",
      description: "Leave quotas have been updated successfully",
    })
  }

  const handleAddHoliday = () => {
    // In a real app, this would add to the backend
    toast({
      title: "Holiday Added",
      description: "New holiday has been added to the calendar",
    })
  }

  return (
    <Tabs defaultValue="quotas" className="space-y-4">
      <TabsList>
        <TabsTrigger value="quotas">Leave Quotas</TabsTrigger>
        <TabsTrigger value="holidays">Holidays</TabsTrigger>
        <TabsTrigger value="users">User Management</TabsTrigger>
      </TabsList>

      <TabsContent value="quotas" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Annual Leave Quotas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(leaveQuotas).map(([type, quota]) => (
                <div key={type} className="space-y-2">
                  <Label htmlFor={type} className="capitalize">
                    {type.replace("_", " ")} Leave (Days)
                  </Label>
                  <Input
                    id={type}
                    type="number"
                    value={quota}
                    onChange={(e) =>
                      setLeaveQuotas((prev) => ({
                        ...prev,
                        [type]: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    min="0"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveQuotas} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Quotas
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="holidays" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Company Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Holiday Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell>{holiday.name}</TableCell>
                      <TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={holiday.type === "National" ? "default" : "secondary"}>{holiday.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <Button onClick={handleAddHoliday} variant="outline">
                  Add Holiday
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users" className="space-y-4">
        <UserManagement />
      </TabsContent>
    </Tabs>
  )
}
