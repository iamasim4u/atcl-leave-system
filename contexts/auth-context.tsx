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
  password?: string // Added password field for direct reset
}

interface AuthContextType {
  user: User | null
  users: User[] // Expose users for admin panel
  login: (username: string, password: string) => Promise<boolean>
  loginWithOTP: (username: string, otp: string) => Promise<boolean>
  sendOTP: (username: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  otpSent: boolean
  setOtpSent: (sent: boolean) => void
  addUser: (newUser: Omit<User, "id">) => Promise<boolean> // For HR to add users
  updateUser: (userId: string, updates: Partial<User>) => Promise<boolean> // For HR to update users
  deleteUser: (userId: string) => Promise<boolean> // For HR to delete users
  getUserById: (userId: string) => User | undefined // Helper to get user by ID
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const initialMockUsers: User[] = [
  {
    id: "1",
    username: "john.doe",
    name: "John Doe",
    email: "john.doe@atcl.sa",
    role: "employee",
    department: "Software Development",
    managerId: "2",
    password: "password123",
  },
  {
    id: "2",
    username: "sarah.manager",
    name: "Sarah Al-Rashid",
    email: "sarah.manager@atcl.sa",
    role: "manager",
    department: "Software Development",
    password: "password123",
  },
  {
    id: "3",
    username: "hr.admin",
    name: "Ahmed Al-Mahmoud",
    email: "hr.admin@atcl.sa",
    role: "hr",
    department: "Human Resources",
    password: "password123",
  },
  {
    id: "4",
    username: "coo.executive",
    name: "Fatima Al-Zahra",
    email: "coo@atcl.sa",
    role: "coo",
    department: "Executive",
    password: "password123",
  },
  {
    id: "5",
    username: "ali.sales",
    name: "Ali Al-Saleh",
    email: "ali.sales@atcl.sa",
    role: "employee",
    department: "Sales",
    managerId: "6",
    password: "password123",
  },
  {
    id: "6",
    username: "omar.salesmgr",
    name: "Omar Al-Farsi",
    email: "omar.salesmgr@atcl.sa",
    role: "manager",
    department: "Sales",
    password: "password123",
  },
  {
    id: "7",
    username: "nora.finance",
    name: "Nora Al-Ghamdi",
    email: "nora.finance@atcl.sa",
    role: "employee",
    department: "Finance",
    managerId: "8",
    password: "password123",
  },
  {
    id: "8",
    username: "fahad.finmgr",
    name: "Fahad Al-Qahtani",
    email: "fahad.finmgr@atcl.sa",
    role: "manager",
    department: "Finance",
    password: "password123",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(initialMockUsers) // State for all users
  const [isLoading, setIsLoading] = useState(true)
  const [otpSent, setOtpSent] = useState(false)
  const [storedOTP, setStoredOTP] = useState<string>("")
  const [otpUsername, setOtpUsername] = useState<string>("")

  useEffect(() => {
    const storedUser = localStorage.getItem("atcl_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call

    const foundUser = users.find((u) => u.username === username)

    if (foundUser && foundUser.password === password) {
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
    const foundUser = users.find((u) => u.username === username)
    if (!foundUser) {
      setIsLoading(false)
      return false
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setStoredOTP(otp)
    setOtpUsername(username)

    try {
      await SimpleEmailService.sendOTP(foundUser.email, otp)
      setOtpSent(true)
      setIsLoading(false)
      alert(`Demo OTP for ${username}: ${otp}\n\nIn production, this would be sent to ${foundUser.email}`)
      return true
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const loginWithOTP = async (username: string, otp: string): Promise<boolean> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call

    if (username !== otpUsername || otp !== storedOTP) {
      setIsLoading(false)
      return false
    }

    const foundUser = users.find((u) => u.username === username)
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

  const addUser = async (newUser: Omit<User, "id">): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const id = `user_${Date.now()}`
    const userToAdd: User = { ...newUser, id, password: newUser.password || "password123" } // Default password
    setUsers((prev) => [...prev, userToAdd])
    return true
  }

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)))
    return true
  }

  const deleteUser = async (userId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    return true
  }

  const getUserById = (userId: string): User | undefined => {
    return users.find((u) => u.id === userId)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        loginWithOTP,
        sendOTP,
        logout,
        isLoading,
        otpSent,
        setOtpSent,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
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
