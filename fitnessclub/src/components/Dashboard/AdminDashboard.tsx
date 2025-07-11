import React, { useState } from "react";
import { useEffect } from "react";
import { apiFetch } from "../../api";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  QrCode,
  Settings,
  Activity,
  ScanLine,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import QRCodeBox from "./QRCodeBox";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [membership, setMembership] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  // Real data from API
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    activePackages: 0,
  });
  type User = {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  };
  type Member = {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
    membership?: string;
    membershipExpiry?: string;
  };
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [scannedUser, setScannedUser] = useState<Member | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [servicePackages, setServicePackages] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/auth/all-users"),
      apiFetch("/members"),
      apiFetch("/appointments/today"),
      apiFetch("/auth/stats"),
      apiFetch("/revenue"),
      apiFetch("/packages"),
    ])
      .then(([users, members, bookings, statsRes, revenue, packages]) => {
        // Handle both array and wrapped object responses
        setAllUsers(Array.isArray(users) ? users : users.users || []);
        setAllMembers(Array.isArray(members) ? members : members.members || []);
        setTodayBookings(bookings);
        setStats(statsRes);
        setRevenueData(revenue);
        setServicePackages(packages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Membership check for logged in user
    if (user && user._id) {
      apiFetch(`/members/${user._id}`)
        .then((member) => {
          setMembership(member);
          if (member && member.membership === "paid") {
            setShowQR(true);
          } else {
            setShowQR(false);
          }
        })
        .catch(() => setShowQR(false));
    }
  }, [user]);

  const handleUpgradeMembership = async () => {
    setUpgrading(true);
    setUpgradeError(null);
    try {
      // Call backend API to upgrade membership
      const res = await apiFetch(`/members/${user._id || user.id}/upgrade`, {
        method: "POST",
        body: JSON.stringify({ membership: "paid" }),
        headers: { "Content-Type": "application/json" },
      });
      if (res && res.membership === "paid") {
        setMembership(res);
        setShowQR(true);
      } else {
        setUpgradeError("Upgrade failed. Please try again.");
      }
    } catch (err: any) {
      setUpgradeError(err.message || "Upgrade failed.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-orange-500">{user?.name}</span>
          </h1>
          <p className="text-gray-400">Here's your business overview</p>
        </div>
        {/* Membership & QR Code or Upgrade Option */}
        {membership &&
          membership.membership !== "paid" &&
          user?.role === "user" && (
            <div className="mb-8 flex flex-col items-center">
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Upgrade Membership
                </h2>
                <p className="mb-4 text-gray-700">
                  Your current membership is{" "}
                  <span className="font-semibold">
                    {membership.membership || "not paid"}
                  </span>
                  . Upgrade to access all features.
                </p>
                <button
                  onClick={handleUpgradeMembership}
                  disabled={upgrading}
                  className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  {upgrading ? "Upgrading..." : "Upgrade Membership"}
                </button>
                {upgradeError && (
                  <p className="mt-2 text-red-600">{upgradeError}</p>
                )}
              </div>
            </div>
          )}
        {/* Membership & QR Code */}
        {showQR && membership && (
          <div className="mb-8 flex flex-col items-center">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Membership QR Code
              </h2>
              <QRCodeBox member={membership} />
              <div className="mt-4 text-gray-700">
                <p>
                  <span className="font-semibold">Name:</span> {membership.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {membership.email}
                </p>
                <p>
                  <span className="font-semibold">Membership Status:</span>{" "}
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-sm ${
                      membership.membership === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {membership.membership}
                  </span>
                </p>
                {membership.membershipExpiry && (
                  <p>
                    <span className="font-semibold">Expires:</span>{" "}
                    {new Date(membership.membershipExpiry).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">
                  {(allUsers.length ?? 0).toLocaleString()}
                </p>
                <p className="text-green-400 text-sm">+12% from last month</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Paid Memberships</p>
                <p className="text-3xl font-bold text-white">
                  {allMembers.filter((m) => m.membership === "paid").length}
                </p>
                <p className="text-green-400 text-sm">Active</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Revenue</p>
                <p className="text-3xl font-bold text-white">
                  {`RWF ${(
                    allMembers.filter((m) => m.membership === "paid").length *
                    20000
                  ).toLocaleString()}`}
                </p>
                <p className="text-green-400 text-sm">From memberships</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Packages</p>
                <p className="text-3xl font-bold text-white">
                  {servicePackages.length}
                </p>
                <p className="text-green-400 text-sm">Available</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              onClick={() => setShowScanner(true)}
            >
              <ScanLine className="w-5 h-5" />
              <span>Scan Membership QR</span>
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Add New User</span>
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Manage Services</span>
            </button>
          </div>
          {/* QR Scanner Modal */}
          {showScanner && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Scan User QR Code</h2>
                {/* Replace with actual QR scanner logic */}
                <input
                  type="text"
                  placeholder="Paste scanned user ID here..."
                  className="border p-2 w-full mb-4"
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id.length > 5) {
                      apiFetch(`/members/${id}`)
                        .then((member) => setScannedUser(member))
                        .catch(() => setScannedUser(null));
                    }
                  }}
                />
                {scannedUser ? (
                  <div className="bg-gray-100 rounded p-4">
                    <p>
                      <strong>Name:</strong> {scannedUser.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {scannedUser.email}
                    </p>
                    <p>
                      <strong>Membership:</strong> {scannedUser.membership}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {scannedUser.membership === "paid" ? "Paid" : "Not Paid"}
                    </p>
                    {scannedUser.membershipExpiry && (
                      <p>
                        <strong>Expires:</strong>{" "}
                        {new Date(
                          scannedUser.membershipExpiry
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Scan a QR code to view membership status.
                  </p>
                )}
                <button
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
                  onClick={() => setShowScanner(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users & Memberships Table */}
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 col-span-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-orange-500" />
              Users & Memberships
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-gray-800 text-gray-300">
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Email</th>
                    <th className="py-2 px-4">Role</th>
                    <th className="py-2 px-4">Membership</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => {
                    const member = allMembers.find(
                      (m) => m.email === user.email
                    );
                    return (
                      <tr
                        key={user._id || user.id}
                        className="border-b border-gray-700"
                      >
                        <td className="py-2 px-4 text-white">{user.name}</td>
                        <td className="py-2 px-4 text-gray-300">
                          {user.email}
                        </td>
                        <td className="py-2 px-4 text-gray-300">{user.role}</td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              member?.membership === "paid"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {member?.membership || "none"}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          {member?.membership === "paid" ? "Paid" : "Not Paid"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Service Packages & Options */}
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-orange-500" />
              Manage Services & Packages
            </h2>
            <div className="space-y-2">
              {servicePackages.map((pkg) => (
                <div
                  key={pkg._id || pkg.id}
                  className="bg-gray-800/50 rounded p-3 mb-2"
                >
                  <p className="text-white font-semibold">{pkg.name}</p>
                  <p className="text-gray-300 text-sm">{pkg.description}</p>
                  <p className="text-orange-400 text-xs">
                    Price: RWF {pkg.price} | Duration: {pkg.duration} |
                    Sessions: {pkg.sessions}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-500" />
              Today's Bookings
            </h2>
            <div className="space-y-4">
              {todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">
                        {booking.client}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {booking.service} - {booking.time}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === "confirmed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart & Streams */}
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              Revenue Overview
            </h2>
            <div className="h-64 flex items-end space-x-4">
              {servicePackages.map((pkg, idx) => (
                <div
                  key={pkg._id || pkg.id}
                  className="flex-1 flex flex-col items-center"
                >
                  <div
                    className="w-full bg-orange-500 rounded-t-lg hover:bg-orange-600 transition-colors duration-200"
                    style={{
                      height: `${
                        (pkg.revenue ? pkg.revenue / 100000 : 0) * 100
                      }%`,
                    }}
                  ></div>
                  <p className="text-xs text-gray-400 mt-2">{pkg.name}</p>
                  <p className="text-xs text-white">
                    RWF {pkg.revenue ? pkg.revenue.toLocaleString() : "0"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
