import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToasterProvider } from "./components/Toaster"

// Pages
import Login from "./pages/Login"
import CreateAdmin from "./pages/CreateAdmin"
import ResetAdmin from "./pages/ResetAdmin"
import ResetPassword from "./pages/ResetPassword"
import ParishionerManagement from "./pages/BCC Groups/ParishionerManagement"
import BccGroupDetails from "./pages/Family/BccGroupDetails"
import FamilyDetails from "./pages/FamilyMembers/FamilyDetails"
import SacramentRecords from "./pages/SacramentRecords"
import Events from "./pages/Events/Events"
import Transactions from "./pages/Transactions"

// Mock authentication state - replace with actual auth logic
const isAuthenticated = true

function App() {
  return (
    <ToasterProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route path="/reset-admin" element={<ResetAdmin />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            {isAuthenticated ? (
              <>
                <Route path="/" element={<Navigate to="/parishioners" replace />} />
                <Route path="/parishioners" element={<ParishionerManagement />} />
                <Route path="/parishioners/groups/:groupId" element={<BccGroupDetails />} />
                <Route path="/parishioners/families/:familyId" element={<FamilyDetails />} />
                <Route path="/sacraments" element={<SacramentRecords />} />
                <Route path="/events" element={<Events />} />
                <Route path="/transactions" element={<Transactions />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </div>
      </Router>
    </ToasterProvider>
  )
}

export default App
