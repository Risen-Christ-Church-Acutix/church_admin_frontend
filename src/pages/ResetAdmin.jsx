import { useState } from "react";
import { Mail, Send, AlertCircle } from "lucide-react";
import axiosInstance from "../api-handler/api-handler";

const ResetAdmin = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      console.log(email);
      const res = await axiosInstance.post("/api/auth/sendResetPasswordEmail",{
        email
    });
      if (res.status === 200) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url('/assets/church-bg.jpg')` }}
      />
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden z-10">
        <div className="bg-gradient-to-r from-amber-800 via-orange-800 to-red-800 py-6 px-6 text-white">
          <h2 className="text-2xl font-bold text-center">Risen Christ Church</h2>
          <p className="text-amber-100 text-center">Administrator Password Reset</p>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Reset Email Sent</h3>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="admin@risenchurch.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
              </div>

              {error && (
                <div className="flex items-center text-sm text-red-600 mb-4">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-md text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700"
                }`}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetAdmin;
