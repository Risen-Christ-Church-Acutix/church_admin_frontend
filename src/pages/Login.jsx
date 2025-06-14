"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { useToaster } from "../components/Toaster"
import { Users, Mail, Lock } from "lucide-react"

// do not touch this for now

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { success, error, warning } = useToaster()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock login logic - replace with actual API call
      if (formData.email === "admin@church.com" && formData.password === "password") {
        success("Login successful! Welcome back.")
        navigate("/parishioners")
      } else if (formData.email === "unverified@church.com") {
        warning("Please verify your email before logging in.")
        // Show verification options
      } else {
        error("Invalid email or password.")
      }
    } catch (err) {
      error("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = () => {
    success("Verification email sent! Please check your inbox.")
  }

  const handleResetPassword = () => {
    success("Password reset email sent! Please check your inbox.")
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
            <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-amber-900">St. Augustine Parish</CardTitle>
            <CardDescription className="text-amber-700">Administration System Login</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-900">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-900">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center">
                <span className="text-sm text-amber-700">Need to create an admin account?</span>
              </div>
              <Link to="/create-admin">
                <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                  Create Admin Account
                </Button>
              </Link>

              {/* Conditional buttons for unverified users */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={handleResendVerification}
                >
                  Resend Verification Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  onClick={handleResetPassword}
                >
                  Reset Password
                </Button>
                <Link to="/reset-admin">
                  <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                    Reset Admin Details
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
