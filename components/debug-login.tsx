"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const testLogin = () => {
    console.log("Testing login with:", { username, password })

    if (username === "john.doe" && password === "password123") {
      setMessage("✅ Login would succeed!")
      console.log("✅ Login successful")
    } else {
      setMessage("❌ Login failed. Try: john.doe / password123")
      console.log("❌ Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Debug Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Username:</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="john.doe" />
          </div>

          <div>
            <label>Password:</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>

          <Button onClick={testLogin} className="w-full">
            Test Login
          </Button>

          {message && <div className="p-3 border rounded">{message}</div>}

          <div className="text-sm text-gray-600">
            <p>
              <strong>Valid Credentials:</strong>
            </p>
            <p>Username: john.doe</p>
            <p>Password: password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
