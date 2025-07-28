"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Update the component to include OTP login
export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const { login, loginWithOTP, sendOTP, isLoading, otpSent, setOtpSent } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Please enter both username and password")
      return
    }

    const success = await login(username, password)

    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to ATCL Leave Management System",
      })
    } else {
      setError("Invalid username or password")
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username) {
      setError("Please enter your username")
      return
    }

    const success = await sendOTP(username)

    if (success) {
      toast({
        title: "OTP Sent",
        description: "Check your email for the 6-digit verification code",
      })
    } else {
      setError("Invalid username or failed to send OTP")
    }
  }

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !otp) {
      setError("Please enter both username and OTP")
      return
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits")
      return
    }

    const success = await loginWithOTP(username, otp)

    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to ATCL Leave Management System",
      })
    } else {
      setError("Invalid OTP or expired")
    }
  }

  // Replace the form content with tabs
  return (
    <div className="min-h-screen atcl-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="atcl-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">ATCL Leave System</CardTitle>
            <CardDescription className="text-gray-600">
              Aspiring Technologies Company Limited
              <br />
              Employee Leave Management Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="otp">Email OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="otp">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username-otp">Username</Label>
                      <Input
                        id="username-otp"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        disabled={isLoading}
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP to Email"
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOTPLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username-verify">Username</Label>
                      <Input
                        id="username-verify"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otp">6-Digit OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="Enter OTP from email"
                        maxLength={6}
                        className="font-mono text-center text-lg tracking-widest"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500">Check your email for the 6-digit code</p>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify & Sign In"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => setOtpSent(false)}
                        disabled={isLoading}
                      >
                        Back to Send OTP
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p className="mb-2">Demo Credentials:</p>
              <div className="text-xs space-y-1">
                <p>
                  <strong>Employee:</strong> john.doe / password123
                </p>
                <p>
                  <strong>Manager:</strong> sarah.manager / password123
                </p>
                <p>
                  <strong>HR:</strong> hr.admin / password123
                </p>
                <p>
                  <strong>COO:</strong> coo.executive / password123
                </p>
              </div>
              <p className="mt-2 text-xs text-blue-600">💡 Try Email OTP: Enter username and check console for OTP</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-white text-sm">
          © ATCL Leave System | Powered by Aspiring Technologies
        </div>
      </div>
    </div>
  )
}
