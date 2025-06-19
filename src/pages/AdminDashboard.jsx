import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axiosInstance from "../api-handler/api-handler";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Key,
  Search,
  Filter,
  Shield,
  X,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ACCOUNTANT",
  });
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, currentUserRes] = await Promise.all([
        axiosInstance.get("/api/admin/users"),
        axiosInstance.get("/api/admin/current"),
      ]);
      
      setUsers(usersRes.data);
      setCurrentUser(currentUserRes.data);
    } catch (err) {
      if(err.response.data.message==="Forbidden"){
        navigate("/forbidden");
      }
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const staffCount = users.filter((u) => u.role !== "ADMIN").length;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormData = () => {
    setFormData({ name: "", email: "", password: "", role: "" });
    setPasswordData({ password: "", confirmPassword: "" });
    setFormError("");
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.email || !formData.password)
      return setFormError("All fields are required");
    if (formData.password.length < 6)
      return setFormError("Password must be at least 6 characters");
    const emailExists = users.some(
      (u) => u.email.toLowerCase() === formData.email.toLowerCase()
    );
    if (emailExists)
      return setFormError("A user with this email already exists");
    try {
      const res = await axiosInstance.post("/api/admin/users", formData);
      setUsers((prev) => [...prev, res.data]);
      setShowAddModal(false);
      resetFormData();
    } catch (err) {
      setFormError("Failed to add user");
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.email)
      return setFormError("Name and email are required");
    const emailExists = users.some(
      (u) =>
        u.id !== selectedUser.id &&
        u.email.toLowerCase() === formData.email.toLowerCase()
    );
    if (emailExists)
      return setFormError("A user with this email already exists");
    try {
      const res = await axiosInstance.put(
        `/api/admin/users/${selectedUser.id}`,
        { name: formData.name, email: formData.email, role: formData.role }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? res.data : u))
      );
      setShowEditModal(false);
      resetFormData();
    } catch {
      setFormError("Failed to update user");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!passwordData.password) return setFormError("Password is required");
    if (passwordData.password.length < 6)
      return setFormError("Password must be at least 6 characters");
    if (passwordData.password !== passwordData.confirmPassword)
      return setFormError("Passwords do not match");
    try {
      await axiosInstance.put(`/api/admin/users/${selectedUser.id}/password`, {
        password: passwordData.password,
      });
      setShowPasswordModal(false);
      resetFormData();
    } catch {
      setFormError("Failed to update password");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !currentUser) return;
    if (selectedUser.id === currentUser.id)
      return setFormError("You cannot delete your own account");
    try {
      await axiosInstance.delete(`/api/admin/users/${selectedUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
    } catch {
      setFormError("Failed to delete user");
    }
  };

  const handleBackdropClick = (setter) => (e) => {
    if (e.target === e.currentTarget) setter(false);
  };

  const openEditModal = (user) => {
    console.log(user);
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setShowEditModal(true);
  };
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setFormError("");
    setShowDeleteModal(true);
  };
  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordData({ password: "", confirmPassword: "" });
    setFormError("");
    setShowPasswordModal(true);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          User Administration
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <h3 className="text-3xl font-bold">{users.length}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Administrators</p>
                <h3 className="text-3xl font-bold">{adminCount}</h3>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Staff Members</p>
                <h3 className="text-3xl font-bold">{staffCount}</h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="ADMIN">Admin</option>
                    <option value="PRIEST">Priest</option>
                    <option value="SECRETARY">Secretary</option>
                    <option value="CATECHIST">Catechist</option>
                    <option value="ACCOUNTANT">Accountant</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  resetFormData();
                  setShowAddModal(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-md hover:from-amber-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Add New User
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Password
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-red-500 flex items-center justify-center text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            {currentUser && user.id === currentUser.id && (
                              <span className="...">You</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            {
                              ADMIN: "bg-red-100 text-red-800",
                              PRIEST: "bg-blue-100 text-blue-800",
                              SECRETARY: "bg-green-100 text-green-800",
                              CATECHIST: "bg-purple-100 text-purple-800",
                              ACCOUNTANT: "bg-yellow-100 text-yellow-800",
                            }[user.role] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="text-amber-600 hover:text-amber-900 text-sm font-medium"
                        >
                          View/Change
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className={`text-red-600 hover:text-red-900 ${
                            user.id === currentUser.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={currentUser && user.id === currentUser.id}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick(setShowAddModal)}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">Add New User</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-medium mb-2"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-medium mb-2"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-medium mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-medium mb-2"
                  htmlFor="role"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="all">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="PRIEST">Priest</option>
                  <option value="SECRETARY">Secretary</option>
                  <option value="CATECHIST">Catechist</option>
                  <option value="ACCOUNTANT">Accountant</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-md hover:from-amber-700 hover:to-red-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick(setShowEditModal)}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-medium mb-2"
                  htmlFor="edit-name"
                >
                  Full Name
                </label>
                <input
                  id="edit-name"
                  name="name"
                  type="text"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-medium mb-2"
                  htmlFor="edit-email"
                >
                  Email Address
                </label>
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-medium mb-2"
                  htmlFor="edit-role"
                >
                  Role
                </label>
                <select
                  id="edit-role"
                  name="role"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="PRIEST">Priest</option>
                  <option value="SECRETARY">Secretary</option>
                  <option value="CATECHIST">Catechist</option>
                  <option value="ACCOUNTANT">Accountant</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-600 text-white rounded-md hover:from-amber-700 hover:to-red-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick(setShowPasswordModal)}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">
                {currentUser &&
                selectedUser &&
                currentUser.id === selectedUser.id
                  ? "Change Your Password"
                  : `Change Password for ${selectedUser.name}`}
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Current Password Display */}
              <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-md">
                <p className="text-sm text-amber-800 mb-1">
                  User: <strong>{selectedUser.email}</strong>
                </p>
              </div>

              <form onSubmit={handleUpdatePassword}>
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>{formError}</p>
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
                    name="password"
                    type="password"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
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
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
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
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick(setShowDeleteModal)}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-red-600">Delete User</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {formError}
                </div>
              )}

              <div className="mb-6">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-center text-gray-700 mb-1">
                  Are you sure you want to delete the following user?
                </p>
                <p className="text-center font-bold mb-4">
                  {selectedUser.name} ({selectedUser.email})
                </p>
                <p className="text-center text-sm text-red-600">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={
                    currentUser &&
                    selectedUser &&
                    selectedUser.id === currentUser.id
                  }
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
