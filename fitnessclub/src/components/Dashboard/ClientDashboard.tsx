import React, { useState } from "react";
import { apiFetch } from "../../api";
import {
  Calendar,
  Package,
  Clock,
  QrCode,
  CreditCard,
  Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import QRCodeDisplay from "../QRCode/QRCodeDisplay";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import { public_key } from "../../config/flutterwaveKey";

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showQRCode, setShowQRCode] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [membershipType, setMembershipType] = useState<string>("monthly");
  const [price, setPrice] = useState<number>(300);
  // Track payment status and subscription info
  const [paymentStatus, setPaymentStatus] = useState<string>(
    user?.membership === "paid" ? "Paid" : "Not Paid"
  );
  const [subscriptionChosen, setSubscriptionChosen] = useState<string>(
    user?.membership || "none"
  );
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  type PackageType = {
    id: string;
    name: string;
    type: string;
    remaining: number;
    total: number;
    expires: string;
  };
  type BookingType = {
    id: string;
    type: string;
    date: string;
    time: string;
    status: string;
  };
  type ActivityType = {
    id: string;
    type: string;
    date: string;
    time: string;
    sessionsUsed: number;
  };

  // Dynamic data from backend
  const [stats, setStats] = useState({
    activePackages: 0,
    remainingSessions: 0,
    upcomingBookings: 0,
    totalVisits: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityType[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingType[]>([]);
  const [activePackages, setActivePackages] = useState<PackageType[]>([]);

  React.useEffect(() => {
    Promise.all([
      apiFetch(`/members/${user?._id || user?.id}`), // always get latest member info
      apiFetch("/members/me/stats"),
      apiFetch("/attendance/me"),
      apiFetch("/appointments/me/upcoming"),
      apiFetch("/packages/me/active"),
      apiFetch("/payments/me"),
    ])
      .then(([memberRes, statsRes, activity, bookings, packages, payments]) => {
        setMemberInfo(memberRes);
        setStats(statsRes);
        setRecentActivity(
          Array.isArray(activity)
            ? activity.map((a: any) => ({
                id: a.id || a._id || "",
                type: a.type || "",
                date: a.date || "",
                time: a.time || "",
                sessionsUsed: a.sessionsUsed || 0,
              }))
            : []
        );
        setUpcomingBookings(
          Array.isArray(bookings)
            ? bookings.map((b: any) => ({
                id: b.id || b._id || "",
                type: b.type || "",
                date: b.date || "",
                time: b.time || "",
                status: b.status || "",
              }))
            : []
        );
        setActivePackages(
          Array.isArray(packages)
            ? packages.map((p: any) => ({
                id: p.id || p._id || "",
                name: p.name || "",
                type: p.type || "",
                remaining: p.remaining || 0,
                total: p.total || 0,
                expires: p.expires || "",
              }))
            : []
        );
        if (payments && payments.length > 0) {
          setLastPayment(payments[0]); // Most recent payment
          setPaymentStatus(
            payments[0].status === "completed" ? "Paid" : "Not Paid"
          );
        }
        if (memberRes) {
          setSubscriptionChosen(memberRes.membershipType || "none");
        }
      })
      .catch(() => {});
  }, []);
  React.useEffect(() => {
    if (!user) return;
    Promise.all([
      apiFetch(`/members/${user._id || user.id}`),
      apiFetch("/members/me/stats"),
      apiFetch("/attendance/me"),
      apiFetch("/appointments/me/upcoming"),
      apiFetch("/packages/me/active"),
      apiFetch("/payments/me"),
    ])
      .then(([memberRes, statsRes, activity, bookings, packages, payments]) => {
        setMemberInfo(memberRes);
        setStats(statsRes);
        setRecentActivity(Array.isArray(activity) ? activity : []);
        setUpcomingBookings(Array.isArray(bookings) ? bookings : []);
        setActivePackages(Array.isArray(packages) ? packages : []);
        if (payments && payments.length > 0) {
          setLastPayment(payments[0]);
          setPaymentStatus(
            payments[0].status === "completed" ? "Paid" : "Not Paid"
          );
        }
        if (memberRes) {
          setSubscriptionChosen(memberRes.membershipType || "none");
        }
      })
      .catch(() => {});
  }, [user]);

  React.useEffect(() => {
    // Set price based on membershipType
    if (membershipType === "daily") setPrice(100);
    else if (membershipType === "weekly") setPrice(200);
    else if (membershipType === "monthly") setPrice(300);
    else if (membershipType === "annually") setPrice(400);
  }, [membershipType]);

  // ...existing code...
  const handlePaymentSuccess = async (response: any) => {
    if (response.status === "successful" && user) {
      try {
        let durationDays = 30;
        if (membershipType === "daily") durationDays = 1;
        else if (membershipType === "weekly") durationDays = 7;
        else if (membershipType === "monthly") durationDays = 30;
        else if (membershipType === "annually") durationDays = 365;
        const res = await apiFetch(`/members/${user._id || user.id}/upgrade`, {
          method: "POST",
          body: JSON.stringify({
            membership: membershipType,
            durationDays,
            amount: price,
          }),
          headers: { "Content-Type": "application/json" },
        });
        if (res && res.member) {
          setPaymentStatus("Paid");
          setSubscriptionChosen(membershipType);
          // Force refresh to get latest QR code
          const refreshedMember = await apiFetch(
            `/members/${user._id || user.id}`
          );
          setMemberInfo(refreshedMember);
        } else {
          setUpgradeError("Upgrade failed. Please try again.");
        }
      } catch (err: any) {
        setUpgradeError(err.message || "Upgrade failed.");
      }
    } else {
      setUpgradeError("Payment was not successful.");
    }
    closePaymentModal();
  };

  // ...existing code...
  const flutterwaveConfig = {
    public_key,
    tx_ref: `tx_${Date.now()}_${membershipType}`,
    amount: price,
    currency: "RWF",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: user?.email || "",
      name: user?.name || "",
      phone_number: user?.phone || "0780000000",
    },
    customizations: {
      title: `${
        membershipType.charAt(0).toUpperCase() + membershipType.slice(1)
      } Membership`,
      description: `Upgrade to a ${membershipType} membership`,
      logo: "https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-orange-500">{user?.name}</span>
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your fitness journey
          </p>
        </div>
        {/* Subscription Summary Card */}
        <div className="mb-8 flex justify-center items-center">
          <div className="bg-black/80 border border-orange-500/30 rounded-2xl shadow-lg p-6 w-full max-w-md flex flex-col items-center">
            <h2 className="text-xl font-bold text-orange-500 mb-2">
              Subscription Details
            </h2>
            <div className="text-gray-300 mb-2">
              <span className="font-semibold text-orange-400">Type:</span>{" "}
              {subscriptionChosen.charAt(0).toUpperCase() +
                subscriptionChosen.slice(1)}
            </div>
            <div className="text-gray-300 mb-2">
              <span className="font-semibold text-orange-400">Status:</span>{" "}
              {paymentStatus}
            </div>
            {lastPayment && (
              <>
                <div className="text-gray-300 mb-2">
                  <span className="font-semibold text-orange-400">
                    Last Amount:
                  </span>{" "}
                  {lastPayment.amount} RWF
                </div>
                <div className="text-gray-300 mb-2">
                  <span className="font-semibold text-orange-400">Method:</span>{" "}
                  {lastPayment.method || "N/A"}
                </div>
                <div className="text-gray-300 mb-2">
                  <span className="font-semibold text-orange-400">Date:</span>{" "}
                  {new Date(lastPayment.date).toLocaleString()}
                </div>
              </>
            )}
            {/* Always show QR code if available (from memberInfo or user) */}
            {(memberInfo?.qrCode || user?.qrCode) && (
              <div className="mt-4">
                <span className="font-semibold text-orange-400 block mb-2">
                  Your QR Code:
                </span>
                <QRCodeDisplay value={memberInfo?.qrCode || user?.qrCode} />
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Membership Section */}
        {user && user.membership !== "paid" && (
          <div className="mb-8 flex justify-center items-center">
            <div className="bg-black/80 backdrop-blur-lg border border-orange-500/30 rounded-2xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
              <h2 className="text-2xl font-bold text-orange-500 mb-3 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-orange-500" /> Upgrade
                Membership
              </h2>
              <p className="mb-4 text-gray-300 text-center">
                Your current membership is
                <span className="font-semibold text-orange-400">
                  {" "}
                  {user.membership || "not paid"}{" "}
                </span>
                .<br />
                Upgrade to access all features and packages.
              </p>
              <div className="w-full mb-4">
                <label className="block mb-2 text-gray-200 font-semibold text-left">
                  Choose membership type:
                </label>
                <select
                  value={membershipType}
                  onChange={(e) => setMembershipType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-orange-500/40 bg-black text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="daily">Daily - 100 RWF</option>
                  <option value="weekly">Weekly - 200 RWF</option>
                  <option value="monthly">Monthly - 300 RWF</option>
                  <option value="annually">Annually - 400 RWF</option>
                </select>
              </div>
              <FlutterWaveButton
                {...flutterwaveConfig}
                text={`Pay ${price} RWF & Upgrade`}
                callback={handlePaymentSuccess}
                onClose={() => setUpgradeError(null)}
                className="w-full text-white py-2 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 font-bold mb-2 shadow-md transition duration-300"
              />
              {upgradeError && (
                <p className="mt-2 text-red-500 text-center">{upgradeError}</p>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Packages</p>
                <p className="text-3xl font-bold text-white">
                  {stats.activePackages}
                </p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Remaining Sessions</p>
                <p className="text-3xl font-bold text-white">
                  {stats.remainingSessions}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming Bookings</p>
                <p className="text-3xl font-bold text-white">
                  {stats.upcomingBookings}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Visits</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalVisits}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* QR Code Section - Always show if available */}
        <div className="mb-8">
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your QR Code</h2>
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <QrCode className="w-4 h-4" />
                <span>{showQRCode ? "Hide" : "Show"} QR Code</span>
              </button>
            </div>
            {memberInfo?.qrCode || user?.qrCode ? (
              showQRCode ? (
                <div className="flex justify-center">
                  <QRCodeDisplay
                    value={
                      memberInfo?.qrCode ? memberInfo.qrCode : user?.qrCode
                    }
                  />
                </div>
              ) : (
                <div className="flex justify-center mt-4">
                  <QRCodeDisplay
                    value={
                      memberInfo?.qrCode ? memberInfo.qrCode : user?.qrCode
                    }
                  />
                </div>
              )
            ) : (
              <div className="flex justify-center mt-4">
                <span className="text-gray-400">
                  No QR code available yet. Please upgrade or contact support.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Packages */}
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-500" />
              Active Packages
            </h2>
            <div className="space-y-4">
              {activePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{pkg.name}</h3>
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">
                      {pkg.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                    <span>
                      Sessions: {pkg.remaining}/{pkg.total}
                    </span>
                    <span>Expires: {pkg.expires}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(pkg.remaining / pkg.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-500" />
              Upcoming Bookings
            </h2>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white capitalize">
                        {booking.type}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {booking.date} at {booking.time}
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

          {/* Recent Activity */}
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-500" />
              Recent Activity
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium py-2">
                      Service
                    </th>
                    <th className="text-left text-gray-400 font-medium py-2">
                      Date
                    </th>
                    <th className="text-left text-gray-400 font-medium py-2">
                      Time
                    </th>
                    <th className="text-left text-gray-400 font-medium py-2">
                      Sessions Used
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-800">
                      <td className="py-3 text-white capitalize">
                        {activity.type}
                      </td>
                      <td className="py-3 text-gray-400">{activity.date}</td>
                      <td className="py-3 text-gray-400">{activity.time}</td>
                      <td className="py-3 text-orange-500">
                        {activity.sessionsUsed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
