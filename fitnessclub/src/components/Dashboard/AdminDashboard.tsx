import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, fetchAllUsers, fetchAllPayments } from "../../api";
import {
  Users,
  Calendar,
  TrendingUp,
  Settings,
  ScanLine,
  Download,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import QrScanner from 'qr-scanner';

// Define interfaces for our data structures
interface ServicePackage {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  sessions: number;
  revenue?: number;
}

interface Booking {
  _id: string;
  user: { name: string; email: string };
  servicePackages: { name: string; price: number }[];
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface Payment {
  _id: string;
  user: { name: string; email: string };
  amount: number;
  status: string;
  date: string;
  membershipType: string;
}

interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  membership?: string;
}

interface Member {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  membership?: string;
  membershipExpiry?: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, membersRes, bookingsRes, packagesRes, paymentsRes] = await Promise.all([
          fetchAllUsers(),
          apiFetch("/members"),
          apiFetch("/appointments/all"),
          apiFetch("/packages"),
          fetchAllPayments(),
        ]);

        setAllUsers(usersRes || []);
        setAllMembers(Array.isArray(membersRes) ? membersRes : membersRes.members || []);
        setAllBookings(bookingsRes || []);
        setServicePackages(packagesRes || []);
        setAllPayments(paymentsRes || []);

      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSyncUsers = async () => {
    setSyncStatus("Syncing, please wait...");
    try {
      const response = await apiFetch("/members/sync-users", { method: "POST" });
      setSyncStatus(response.message || "Sync completed successfully!");
    } catch (err: any) {
      setSyncStatus(err.message || "Sync failed. Please check logs.");
    }
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const blob = await apiFetch('/reports/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NewChogmspa_Report.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download report:', err);
      setError('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    let scanner: QrScanner | null = null;
    if (showScanner && videoRef.current) {
      scanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (scanner) scanner.stop();
          setShowScanner(false);
          navigate(`/admin/${result.data}`);
        },
        { highlightScanRegion: true, highlightCodeOutline: true }
      );
      scanner.start();
    }
    return () => { scanner?.destroy(); };
  }, [showScanner, navigate]);

  const handleUpdateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      const updatedBooking = await apiFetch(`/appointments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setAllBookings(currentBookings =>
        currentBookings.map(b => (b._id === id ? { ...b, ...updatedBooking } : b))
      );
    } catch (err) {
      console.error('Failed to update booking status:', err);
      setError('Failed to update appointment status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 font-sans">
      <div className="flex-1 p-6 md:p-10 bg-gray-900 text-white overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.name || "Admin"}!</p>
          </div>
          <button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download Full Report'}
          </button>
        </header>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-6">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 flex flex-col justify-between">
                    <Users className="w-8 h-8 text-orange-500" />
                    <p className="text-3xl font-bold">{allUsers.length}</p>
                    <p className="text-gray-400">Total Users</p>
                </div>
                <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 flex flex-col justify-between">
                    <Users className="w-8 h-8 text-green-500" />
                    <p className="text-3xl font-bold">{allMembers.length}</p>
                    <p className="text-gray-400">Active Members</p>
                </div>
                <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 flex flex-col justify-between">
                    <Calendar className="w-8 h-8 text-blue-500" />
                    <p className="text-3xl font-bold">{allBookings.length}</p>
                    <p className="text-gray-400">Total Bookings</p>
                </div>
                <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 flex flex-col justify-between">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <p className="text-3xl font-bold">RWF {allPayments.reduce((acc, p) => acc + p.amount, 0)}</p>
                    <p className="text-gray-400">Total Revenue</p>
                </div>
            </div>

            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                Recent Appointments
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-300">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="p-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {allBookings.slice(0, 5).map((booking) => (
                      <tr key={booking._id}>
                        <td className="p-3 whitespace-nowrap">{booking.user?.name || 'N/A'}</td>
                        <td className="p-3 whitespace-nowrap">{`${new Date(booking.date).toLocaleDateString()} at ${booking.time}`}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {booking.status === 'pending' && (
                            <div className="flex items-center space-x-2">
                              <button onClick={() => handleUpdateAppointmentStatus(booking._id, 'confirmed')} className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600 transition-colors">Approve</button>
                              <button onClick={() => handleUpdateAppointmentStatus(booking._id, 'cancelled')} className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition-colors">Cancel</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allBookings.length === 0 && <p className="text-gray-500 text-center py-4">No appointments found.</p>}
              </div>
            </div>

            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-orange-500" />
                  Manage Services & Packages
                </h2>
                <Link to="/admin/manage-packages" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">Manage</Link>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {servicePackages.map((pkg) => (
                  <div key={pkg._id || pkg.id} className="bg-gray-800/50 rounded p-3 mb-2">
                    <p className="text-white font-semibold">{pkg.name}</p>
                    <p className="text-gray-300 text-sm">{pkg.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* All Users Table */}
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-orange-500" />
                All Users
              </h2>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                    <tr>
                      <th scope="col" className="p-3">Name</th>
                      <th scope="col" className="p-3">Email</th>
                      <th scope="col" className="p-3">Role</th>
                      <th scope="col" className="p-3">Membership</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user._id || user.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <td className="p-3 font-medium text-white whitespace-nowrap">{user.name}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3 capitalize">{user.role}</td>
                                                <td className="p-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.membership?.toLowerCase() === 'paid'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                            {user.membership ? user.membership : 'Not Paid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allUsers.length === 0 && <p className="text-gray-500 text-center py-4">No users found.</p>}
              </div>
            </div>

            {/* All Payments Table */}
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                All Payments
              </h2>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                    <tr>
                      <th scope="col" className="p-3">User</th>
                      <th scope="col" className="p-3">Amount</th>
                      <th scope="col" className="p-3">Status</th>
                      <th scope="col" className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayments.map((payment) => (
                      <tr key={payment._id} className="border-b border-gray-700 hover:bg-gray-800/50">
                        <td className="p-3 font-medium text-white whitespace-nowrap">{payment.user?.name || 'N/A'}</td>
                        <td className="p-3">RWF {payment.amount.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${ payment.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400' }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="p-3">{new Date(payment.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allPayments.length === 0 && <p className="text-gray-500 text-center py-4">No payments found.</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button onClick={() => setShowScanner(true)} className="w-full flex items-center justify-center bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  <ScanLine className="w-5 h-5 mr-2" />
                  Scan Member QR
                </button>
                <Link to="/admin/manage-users" className="w-full flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  <Users className="w-5 h-5 mr-2" />
                  Manage Users
                </Link>
                <button onClick={handleSyncUsers} className="w-full flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                  <Settings className="w-5 h-5 mr-2" />
                  Sync Users to Members
                </button>
              </div>
              {syncStatus && <p className="text-center text-sm text-gray-400 mt-4">{syncStatus}</p>}
            </div>

            {showScanner && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-gray-900 p-4 rounded-lg relative">
                  <h3 className="text-white text-lg mb-2">Scan QR Code</h3>
                  <video ref={videoRef} className="w-64 h-64 rounded"></video>
                  <button onClick={() => setShowScanner(false)} className="absolute top-2 right-2 text-white">&times;</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
