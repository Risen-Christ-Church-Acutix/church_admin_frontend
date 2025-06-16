import { Link, useLocation } from "react-router-dom";
import { Users, User } from "lucide-react";

// make the background image work

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Background overlay with church imagery */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('/assets/church-bg.jpg')`, // ✅ correct path
        }}
      />

      {/* Header */}
      <header className="relative bg-gradient-to-r from-amber-800 via-orange-800 to-red-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Risen Christ Church </h1>
                <p className="text-amber-100">Administration System</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/parishioners"
                className={`transition-colors ${
                  location.pathname.includes("/parishioners")
                    ? "text-amber-200 font-semibold"
                    : "hover:text-amber-200"
                }`}
              >
                Parishioners
              </Link>
              <Link
                to="/events"
                className={`transition-colors ${
                  location.pathname.includes("/events")
                    ? "text-amber-200 font-semibold"
                    : "hover:text-amber-200"
                }`}
              >
                Events
              </Link>
              <Link
                to="/sacraments"
                className={`transition-colors ${
                  location.pathname.includes("/sacraments")
                    ? "text-amber-200 font-semibold"
                    : "hover:text-amber-200"
                }`}
              >
                Sacraments
              </Link>
              <Link
                to="/transactions"
                className={`transition-colors ${
                  location.pathname.includes("/transactions")
                    ? "text-amber-200 font-semibold"
                    : "hover:text-amber-200"
                }`}
              >
                Transactions
              </Link>
              <Link
                to="/admin"
                className={`transition-colors ${
                  location.pathname.includes("/admin")
                    ? "text-amber-200 font-semibold"
                    : "hover:text-amber-200"
                }`}
              >
                Admin
              </Link>
              <Link
                to="/profile"
                className={`transition-colors flex items-center space-x-1 ${
                  location.pathname.includes("/profile")
                    ? "text-amber-200 font-semibold"
                    : "hover:text-amber-200"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">{children}</main>
    </div>
  );
};

export default Layout;
