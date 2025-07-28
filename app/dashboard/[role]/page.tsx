"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import EmployeeDashboard from "@/components/dashboards/employee-dashboard"
import ManagerDashboard from "@/components/dashboards/manager-dashboard"
import HRDashboard from "@/components/dashboards/hr-dashboard"
import COODashboard from "@/components/dashboards/coo-dashboard"
import { Loader2 } from "lucide-react"

export default function DashboardPage({ params }: { params: { role: string } }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (user && user.role !== params.role) {
      router.push(`/dashboard/${user.role}`)
    }
  }, [user, isLoading, params.role, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  switch (params.role) {
    case "employee":
      return <EmployeeDashboard />
    case "manager":
      return <ManagerDashboard />
    case "hr":
      return <HRDashboard />
    case "coo":
      return <COODashboard />
    default:
      return <div>Invalid role</div>
  }
}
