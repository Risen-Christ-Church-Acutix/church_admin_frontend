import { createContext, useState, useContext, useEffect } from "react";

// Mock user data
const mockUsers = [
  {
    id: 1,
    email: "admin@risenchurch.org",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    id: 2,
    email: "staff@risenchurch.org",
    password: "staff123",
    name: "Staff Member",
    role: "staff",
  }
];

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(mockUsers[0]); // Default to admin for now
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default logged in state
  const [users, setUsers] = useState(mockUsers);

  const login = (email, password) => {
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      return { success: true, user };
    }
    
    return { 
      success: false, 
      isAdmin: email.toLowerCase() === "admin@risenchurch.org", 
      message: "Invalid credentials"
    };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (userId, updatedData) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, ...updatedData } : user
    ));
    
    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
    }
  };

  const addUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData
    };
    setUsers([...users, newUser]);
    return newUser;
  };

  const deleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const value = {
    currentUser,
    isLoggedIn,
    users,
    login,
    logout,
    updateUser,
    addUser,
    deleteUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};