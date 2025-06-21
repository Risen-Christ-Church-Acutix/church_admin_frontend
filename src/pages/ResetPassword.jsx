import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Key, Check, AlertCircle } from "lucide-react";
import axiosInstance from "../api-handler/api-handler";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axiosInstance.post("/api/auth/resetAdminPassword", {
        token,
        newPassword: password,
      });

      if (res.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Server error. Please try again."
      );
    }
  };

  // Mock validation of token
  const isValidToken = !!token && !!email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url('/assets/church-bg.jpg')` }}
      />

      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden z-10">
        <div className="bg-gradient-to-r from-amber-800 via-orange-800 to-red-800 py-6 px-6 text-white">
          <h2 className="text-2xl font-bold text-center">
            Risen Christ Church
          </h2>
          <p className="text-amber-100 text-center">Reset Password</p>
        </div>

        <div className="p-6">
          {!isValidToken ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Invalid or Expired Link
              </h3>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-md hover:from-amber-700 hover:to-red-700 transition"
              >
                Return to Login
              </button>
            </div>
          ) : success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Password Reset Successful
              </h3>
              <p className="text-gray-600">
                Your password has been reset successfully. Redirecting to
                login...
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-medium text-gray-900 mb-6 text-center">
                Create New Password
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-md">
                <p className="text-sm text-amber-800">
                  Resetting password for: <strong>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="password"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 6 characters
                  </p>
                </div>

                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="confirm-password"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirm-password"
                      type="password"
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-700 to-red-700 text-white py-2 px-4 rounded-md hover:from-amber-800 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
                >
                  Reset Password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
