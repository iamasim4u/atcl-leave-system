"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { SimpleEmailService } from "@/lib/email-service-simple"

export type UserRole = "employee" | "manager" | "hr" | "coo"

export interface User {
  id: string
  username: string
  name: string
  email: string
  role: UserRole
  department: string
  managerId?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  loginWithOTP: (username: string, otp: string) => Promise<boolean>
  sendOTP: (username: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  otpSent: boolean
  setOtpSent: (sent: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    username: "john.doe",
    name: "John Doe",
    email: "john.doe@atcl.sa",
    role: "employee",
    department: "Software Development",
    managerId: "2",
  },
  {
    id: "2",
    username: "sarah.manager",
    name: "Sarah Al-Rashid",
    email: "sarah.manager@atcl.sa",
    role: "manager",
    department: "Software Development",
  },
  {
    id: "3",
    username: "hr.admin",
    name: "Ahmed Al-Mahmoud",
    email: "hr.admin@atcl.sa",
    role: "hr",
    department: "Human Resources",
  },
  {
    id: "4",
    username: "coo.executive",
    name: "Fatima Al-Zahra",
    email: "coo@atcl.sa",
    role: "coo",
    department: "Executive",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [otpSent, setOtpSent] = useState(false)
  const [storedOTP, setStoredOTP] = useState<string>("")
  const [otpUsername, setOtpUsername] = useState<string>("")

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("atcl_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.username === username)

    if (foundUser && password === "password123") {
      setUser(foundUser)
      localStorage.setItem("atcl_user", JSON.stringify(foundUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const sendOTP = async (username: string): Promise<boolean> => {
    setIsLoading(true)

    const foundUser = mockUsers.find((u) => u.username === username)
    if (!foundUser) {
      setIsLoading(false)
      return false
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setStoredOTP(otp)
    setOtpUsername(username)

    try {
      await SimpleEmailService.sendOTP(foundUser.email, otp)
      setOtpSent(true)
      setIsLoading(false)

      // Show OTP in alert for demo purposes
      alert(`Demo OTP for ${username}: ${otp}\n\nIn production, this would be sent to ${foundUser.email}`)

      return true
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const loginWithOTP = async (username: string, otp: string): Promise<boolean> => {
    setIsLoading(true)

    if (username !== otpUsername || otp !== storedOTP) {
      setIsLoading(false)
      return false
    }

    const foundUser = mockUsers.find((u) => u.username === username)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("atcl_user", JSON.stringify(foundUser))
      setOtpSent(false)
      setStoredOTP("")
      setOtpUsername("")
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("atcl_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithOTP,
        sendOTP,
        logout,
        isLoading,
        otpSent,
        setOtpSent,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
