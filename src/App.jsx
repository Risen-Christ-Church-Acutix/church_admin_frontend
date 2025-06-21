import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToasterProvider } from "./components/Toaster";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import ParishionerManagement from "./pages/BCC Groups/ParishionerManagement";
import BccGroupDetails from "./pages/Family/BccGroupDetails";
import FamilyDetails from "./pages/FamilyMembers/FamilyDetails";
import SacramentRecords from "./pages/SacramentRecords";
import Events from "./pages/Events/Events";
import Transactions from "./pages/Transactions/Transactions";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AccessDenied from "./pages/AccessDenied";
import ResetAdmin from "./pages/ResetAdmin";
import ResetPassword from "./pages/ResetPassword";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/unauthorized" replace />;

  return children;
};

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* Authentication Routes */}
      <Route 
        path="/login" 
        element={isLoggedIn ? <Navigate to="/parishioners" replace /> : <Login />} 
      />
      <Route path="/forgot-password" element={<ResetAdmin />} />
      <Route path="/reset-password" element={<ResetPassword/>}/>

      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/parishioners" replace />} />
      <Route path="/forbidden" element={<AccessDenied/>} />
      
      <Route path="/parishioners" element={
        <ProtectedRoute>
          <ParishionerManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/parishioners/groups/:groupId" element={
        <ProtectedRoute>
          <BccGroupDetails />
        </ProtectedRoute>
      } />
      
      <Route path="/parishioners/families/:familyId" element={
        <ProtectedRoute>
          <FamilyDetails />
        </ProtectedRoute>
      } />
      
      <Route path="/sacraments" element={
        <ProtectedRoute>
          <SacramentRecords />
        </ProtectedRoute>
      } />
      
      <Route path="/events" element={
        <ProtectedRoute>
          <Events />
        </ProtectedRoute>
      } />
      
      <Route path="/transactions" element={
        <ProtectedRoute>
          <Transactions />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToasterProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </ToasterProvider>
    </AuthProvider>
  );
}

export default App;
