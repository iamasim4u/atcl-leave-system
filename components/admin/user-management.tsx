"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, UserPlus, Key, Trash2, Edit } from "lucide-react"
import { useAuth, type User, type UserRole } from "@/contexts/auth-context"

export default function UserManagement() {
  const { toast } = useToast()
  const { users, addUser, updateUser, deleteUser } = useAuth() // Get users and functions from AuthContext

  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    email: "",
    role: "employee" as UserRole,
    department: "",
    password: "password123", // Default password for new users
    managerId: "none", // For new employees
  })

  const departments = [
    "Software Development",
    "Human Resources",
    "Finance",
    "Marketing",
    "Operations",
    "Sales",
    "Services",
    "Executive",
  ]
  const managers = users.filter((u) => u.role === "manager")

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.name || !newUser.email || !newUser.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const success = await addUser(newUser)

    if (success) {
      toast({
        title: "User Added",
        description: `${newUser.name} has been added to the system`,
      })
      setNewUser({
        username: "",
        name: "",
        email: "",
        role: "employee",
        department: "",
        password: "password123",
        managerId: "none",
      })
      setShowAddUser(false)
    } else {
      toast({
        title: "Error",
        description: "Failed to add user.",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditUser(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    const success = await updateUser(editingUser.id, editingUser)
    if (success) {
      toast({
        title: "User Updated",
        description: `${editingUser.name}'s details have been updated.`,
      })
      setShowEditUser(false)
      setEditingUser(null)
    } else {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`)) {
      const success = await deleteUser(userId)
      if (success) {
        toast({
          title: "User Deleted",
          description: `${userName} has been removed from the system.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user.",
          variant: "destructive",
        })
      }
    }
  }

  const handleResetPassword = async (user: User) => {
    const newPassword = prompt(`Enter new password for ${user.name}:`)
    if (newPassword) {
      const success = await updateUser(user.id, { password: newPassword })
      if (success) {
        toast({
          title: "Password Reset",
          description: `${user.name}'s password has been reset to: ${newPassword}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to reset password.",
          variant: "destructive",
        })
      }
    }
  }

  const handleSendWelcomeEmail = (user: User) => {
    // In production, this would send a welcome email with login instructions
    toast({
      title: "Welcome Email Sent",
      description: `Welcome email sent to ${user.email}`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            User Management
          </CardTitle>
          <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="john.doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@atcl.sa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: UserRole) => setNewUser((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="coo">COO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={newUser.department}
                    onValueChange={(value) => setNewUser((prev) => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newUser.role === "employee" && (
                  <div className="space-y-2">
                    <Label htmlFor="managerId">Manager (Optional)</Label>
                    <Select
                      value={newUser.managerId}
                      onValueChange={(value) => setNewUser((prev) => ({ ...prev, managerId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Manager</SelectItem>
                        {managers
                          .filter((m) => m.department === newUser.department)
                          .map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name} ({manager.department})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Only managers from the selected department are shown.</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                    Add User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="font-mono text-sm">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "coo" ? "default" : user.role === "hr" ? "secondary" : "outline"}
                    className="capitalize"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleResetPassword(user)}>
                      <Key className="w-3 h-3 mr-1" />
                      Reset Password
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id, user.name)}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to user details.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, username: e.target.value } : null))}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: UserRole) =>
                    setEditingUser((prev) => (prev ? { ...prev, role: value } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="coo">COO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select
                  value={editingUser.department}
                  onValueChange={(value) => setEditingUser((prev) => (prev ? { ...prev, department: value } : null))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingUser.role === "employee" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-managerId">Manager</Label>
                  <Select
                    value={editingUser.managerId || "none"}
                    onValueChange={(value) => setEditingUser((prev) => (prev ? { ...prev, managerId: value } : null))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Manager</SelectItem>
                      {managers
                        .filter((m) => m.department === editingUser.department)
                        .map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} ({manager.department})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Only managers from the selected department are shown.</p>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditUser(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
