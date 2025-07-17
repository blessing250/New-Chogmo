import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingHeader from "./components/Landing/LandingHeader";
import LandingPage from "./components/Landing/LandingPage";
import Header from "./components/Layout/Header";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import ClientDashboard from "./components/Dashboard/ClientDashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import ManagePackages from "./pages/ManagePackages";
import Reports from "./pages/Reports";
import Appointments from "./pages/Appointments";
import Payments from "./pages/Payments";
import Attendance from "./pages/Attendance";
import BookAppointment from "./pages/BookAppointment";

import QRCodeResult from "./components/QRCode/QRCodeResult";
import UserDetailsPage from "./pages/UserDetailsPage";
import AdminRoute from "./components/Routes/AdminRoute";

function App() {
  const { user, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrResult, setQRResult] = useState<any>(null);

  // Mock client data for QR code scanning
  const mockClientData = {
    id: "2",
    name: "Blessing Nshuti",
    email: "client@chogmspa.com",
    phone: "+250788888888",
    activePackages: [
      {
        id: "1",
        name: "Gym Premium",
        type: "gym",
        remaining: 12,
        total: 20,
      },
      {
        id: "2",
        name: "Sauna Wellness",
        type: "sauna",
        remaining: 3,
        total: 10,
      },
    ],
    paymentStatus: "current" as const,
    lastVisit: "2024-01-15",
  };

  const handleQRScan = (data: string) => {
    console.log("QR Code scanned:", data);
    setShowQRScanner(false);

    // Mock QR code processing
    if (data.includes("QR_CLIENT_2")) {
      setQRResult(mockClientData);
    }
  };

  const handleCheckIn = (packageId: string) => {
    console.log("Check in for package:", packageId);
    // Update package sessions
    if (qrResult) {
      const updatedPackages = qrResult.activePackages.map((pkg: any) =>
        pkg.id === packageId
          ? { ...pkg, remaining: Math.max(0, pkg.remaining - 1) }
          : pkg
      );
      setQRResult({ ...qrResult, activePackages: updatedPackages });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (!showAuth) {
      return (
        <div className="min-h-screen bg-black">
          <LandingHeader onGetStarted={() => setShowAuth(true)} />
          <LandingPage onGetStarted={() => setShowAuth(true)} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')",
          }}
        />
        <div className="relative z-10">
          {showRegister ? (
            <RegisterForm onToggleForm={() => setShowRegister(false)} />
          ) : (
            <LoginForm onToggleForm={() => setShowRegister(true)} />
          )}

          {/* Back to Landing Button */}
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAuth(false)}
              className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Header />
        {/* Role-based navigation */}
        <nav className="bg-black/80 border-b border-orange-500/20 px-4 py-2 flex gap-4">
          {user.role === "admin" ? (
            <>
              <Link to="/admin" className="text-orange-400 hover:text-white">
                Dashboard
              </Link>
            </>
          ) : (
            <>    
            </>
          )}
        </nav>

        <Routes>
            {/* Client Routes */}
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/book-appointment" element={<BookAppointment />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/manage-packages" element={<AdminRoute><ManagePackages /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
            <Route path="/admin/appointments" element={<AdminRoute><Appointments /></AdminRoute>} />
            <Route path="/admin/payments" element={<AdminRoute><Payments /></AdminRoute>} />
            <Route path="/admin/attendance" element={<AdminRoute><Attendance /></AdminRoute>} />
            <Route path="/admin/:userID" element={<AdminRoute><UserDetailsPage /></AdminRoute>} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />} />
          </Routes>

        {/* QR Code Result Modal */}
        {qrResult && (
          <QRCodeResult
            clientInfo={qrResult}
            onClose={() => setQRResult(null)}
            onCheckIn={handleCheckIn}
          />
        )}

        {/* Floating QR Scanner Button for Admin */}
        {user.role === "admin" && (
          <button
            onClick={() => setShowQRScanner(true)}
            className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zm12 0h2a1 1 0 001-1V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v3a1 1 0 001 1zM5 20h2a1 1 0 001-1v-3a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1z"
              />
            </svg>
          </button>
        )}
      </div>
    </Router>
  );
}

export default App;
