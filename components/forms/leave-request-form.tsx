"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLeave, type LeaveType } from "@/contexts/leave-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, User, Phone } from "lucide-react"

interface LeaveRequestFormProps {
  onSuccess?: () => void
}

export default function LeaveRequestForm({ onSuccess }: LeaveRequestFormProps) {
  const { user } = useAuth()
  const { submitRequest } = useLeave()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    leaveType: "" as LeaveType,
    startDate: "",
    endDate: "",
    exitReentryVisa: false,
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    reason: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const leaveTypes = [
    { value: "annual", label: "Annual Leave" },
    { value: "sick", label: "Sick Leave" },
    { value: "emergency", label: "Emergency Leave" },
    { value: "maternity", label: "Maternity Leave" },
    { value: "hajj", label: "Hajj Leave" },
    { value: "unpaid", label: "Unpaid Leave" },
  ]

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Validation
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (new Date(formData.startDate) < new Date()) {
      toast({
        title: "Invalid Date",
        description: "Cannot request leave for past dates",
        variant: "destructive",
      })
      return
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast({
        title: "Invalid Date Range",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      submitRequest({
        employeeId: user.id,
        employeeName: user.name,
        department: user.department,
        leaveType: formData.leaveType,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        duration: calculateDuration(),
        exitReentryVisa: formData.exitReentryVisa,
        emergencyContact: formData.emergencyContact,
        reason: formData.reason,
      })

      toast({
        title: "Request Submitted",
        description: "Your leave request has been submitted for approval",
      })

      // Reset form
      setFormData({
        leaveType: "" as LeaveType,
        startDate: "",
        endDate: "",
        exitReentryVisa: false,
        emergencyContact: { name: "", phone: "", relationship: "" },
        reason: "",
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Employee Name</Label>
            <Input value={user?.name || ""} disabled />
          </div>
          <div>
            <Label>Department</Label>
            <Input value={user?.department || ""} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Leave Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Leave Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leaveType">Leave Type *</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value: LeaveType) => setFormData((prev) => ({ ...prev, leaveType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (Days)</Label>
              <Input value={calculateDuration()} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="exitReentryVisa"
              checked={formData.exitReentryVisa}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, exitReentryVisa: checked as boolean }))}
            />
            <Label htmlFor="exitReentryVisa">Exit/Re-entry Visa Required</Label>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Leave *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Please provide the reason for your leave request"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              value={formData.emergencyContact.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, name: e.target.value },
                }))
              }
              placeholder="Full name"
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">Phone Number</Label>
            <Input
              id="contactPhone"
              value={formData.emergencyContact.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, phone: e.target.value },
                }))
              }
              placeholder="+966 XX XXX XXXX"
            />
          </div>
          <div>
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              value={formData.emergencyContact.relationship}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, relationship: e.target.value },
                }))
              }
              placeholder="e.g., Spouse, Parent"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  )
}
