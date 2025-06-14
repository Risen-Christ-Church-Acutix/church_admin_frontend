"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { useToaster } from "../components/Toaster"
import { Users, Lock, ChevronLeft } from "lucide-react"

// do not touch this for now

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { success, error } = useToaster()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      error("Passwords do not match.")
      return
    }

    if (formData.newPassword.length < 6) {
      error("Password must be at least 6 characters long.")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      success("Password reset successfully! You can now login with your new password.")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      error("Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 opacity-5 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/placeholder.svg?height=1080&width=1920')`,
        }}
      />

      <div className="relative w-full max-w-md">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200">
          <CardHeader className="text-center bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-amber-900">Reset Password</CardTitle>
            <CardDescription className="text-amber-700">Create a new password for your account</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-amber-900">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-amber-900">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>

            <div className="mt-6">
              <Link to="/login">
                <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword
