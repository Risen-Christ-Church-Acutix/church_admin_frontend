import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Shield,
  Key,
  Edit,
  Save,
  X,
  LogOut,
} from "lucide-react";
import axiosInstance from "../api-handler/api-handler";
import { useToaster } from "../components/Toaster";

const Profile = () => {
  const { user, handleLogout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { success } = useToaster();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/user/${user.id}`);
      setCurrentUser(res.data);
      setName(res.data.name);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        const res = await axiosInstance.put(`/api/user/${user.id}`, { name });
        setCurrentUser(res.data.user);
        success("Name updated successfully");
      } catch (err) {
        console.error(err);
      }
    }
    setIsEditing(!isEditing);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await axiosInstance.put(`/api/user/${user.id}/password`, { password });
      setShowPasswordModal(false);
      setPassword("");
      setConfirmPassword("");
      success("Password updated successfully");
    } catch (err) {
      setPasswordError("Failed to update password");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center text-gray-600 text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-red-500 rounded-full flex items-center justify-center text-white">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-xl sm:text-2xl font-bold border-b border-amber-500 focus:outline-none focus:border-amber-700 bg-transparent"
                      />
                    ) : (
                      <h2 className="text-xl sm:text-2xl font-bold">
                        {currentUser?.name}
                      </h2>
                    )}
                    <p className="text-gray-500 capitalize">
                      {currentUser?.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-1 px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium">{currentUser?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Contact admin to update email address
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium capitalize">
                        {currentUser?.role}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Roles determine your permissions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 md:col-span-2">
                    <Key className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Password</p>
                      <p className="font-medium">••••••••</p>
                      <div className="mt-2 flex justify-between items-center">
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="text-sm text-amber-700 hover:text-amber-900 font-medium"
                        >
                          Change password
                        </button>
                        <button
                          onClick={() => setShowLogoutModal(true)}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6">
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {passwordError}
                </div>
              )}

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-medium mb-2"
                  htmlFor="new-password"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-medium mb-2"
                  htmlFor="confirm-password"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-md hover:from-amber-700 hover:to-red-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">Confirm Logout</h3>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Profile;
