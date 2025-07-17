import React, { useState, useRef, useEffect } from "react";
import { apiFetch } from "../../api";
import {
  Calendar,
  Package,
  Clock,
  CreditCard,
  Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import QRCodeGenerator from "../QRCode/QRCodeGenerator";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import { Link } from "react-router-dom";
import { public_key } from "../../config/flutterwaveKey";

const ClientDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [membershipType, setMembershipType] = useState<string>("monthly");
  const [price, setPrice] = useState<number>(300);
  const [durationDays, setDurationDays] = useState<number>(30);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  // Track payment status and subscription info
  const paymentStatus = user?.membership === "paid" ? "Paid" : "Not Paid";

  const [lastPayment, setLastPayment] = useState<any>(null);
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

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      console.log(user);
      try {
        const [statsRes, activity, bookings, packages, payments] = await Promise.all([
          apiFetch("/members/me/stats"),
          apiFetch("/attendance/me"),
          apiFetch("/appointments/me/upcoming"),
          apiFetch("/packages/me/active"),
          apiFetch("/payments/me"),
        ]);

        setStats(statsRes);
        setRecentActivity(
          Array.isArray(activity)
            ? activity.map((a: any) => ({
              id: a.id || a._id || "",
              type: a.type || "Check-in", // Fallback type
              date: new Date(a.checkInTime).toLocaleDateString(),
              time: new Date(a.checkInTime).toLocaleTimeString(),
              sessionsUsed: 1, // Each check-in is 1 session
            }))
            : []
        );
        setUpcomingBookings(
          Array.isArray(bookings)
            ? bookings.map((b: any) => ({
                id: b._id || b.id,
                // Join service package names if available, otherwise fallback
                type: b.servicePackages?.map((pkg: any) => pkg.name).join(', ') || b.type || 'Appointment',
                date: new Date(b.date).toLocaleDateString(),
                time: b.time,
                status: b.status,
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
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Failed to load dashboard data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, dataVersion]);

  const handlePaymentSuccess = (response: any) => {
    closePaymentModal();
    if (response.status === "successful") {
      apiFetch(`/members/${user?._id || user?.id}/upgrade`, {
        method: "POST",
        body: JSON.stringify({ membership: membershipType, durationDays, amount: price }),
      })
        .then(() => {
          refreshUser(); // Refresh user data from auth context
          setDataVersion(v => v + 1); // Trigger data refetch
          setUpgradeError(null);
        })
        .catch(() => {
          setUpgradeError(
            "Payment was successful, but we couldn't update your membership. Please contact support."
          );
        });
    } else {
      setUpgradeError(
        `Payment was not successful. Status: ${response.status}`
      );
    }
  };



  const handlePaymentClose = () => { };

  const handleDownload = () => {
    if (qrCanvasRef.current) {
      const link = document.createElement('a');
      link.download = 'membership-qr-code.png';
      link.href = qrCanvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  const handlePrint = () => {
    if (qrCanvasRef.current) {
      const dataUrl = qrCanvasRef.current.toDataURL('image/png');
      const windowContent = `
        <!DOCTYPE html>
        <html>
          <head><title>Print QR Code</title></head>
          <body>
            <img src="${dataUrl}" style="max-width: 100%;">
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `;
      const printWin = window.open('', '', 'width=600,height=600');
      printWin?.document.write(windowContent);
      printWin?.document.close();
    }
  };

  const fwConfig = {
    public_key,
    tx_ref: Date.now().toString(),
    amount: price,
    currency: "RWF",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: user?.email || "",
      phone_number: user?.phone || "",
      name: user?.name || "",
    },
    customizations: {
      title: "Fit-Club Membership",
      description: `Payment for ${membershipType} membership`,
      logo: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fdancing_10488398&psig=AOvVaw0_g1N8mB1gB5tZ8zY3Q2jC&ust=1719912193297000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCLDZyLSdiIcDFQAAAAAdAAAAABAE",
    },
  };

  const StatCard = ({ icon, label, value }: any) => (
    <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 flex items-center space-x-4 border border-orange-500/20">
      <div className="bg-orange-500/10 p-3 rounded-full">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex justify-center items-center"><p className="text-orange-500 text-xl">Loading Dashboard...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen bg-black text-white flex justify-center items-center"><p className="text-red-500 text-xl">{error}</p></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome, <span className="text-orange-400">{user?.name}</span>
          </h1>
          <div className="flex items-center space-x-4">
            <Link to="/book-appointment" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Package className="w-6 h-6 text-orange-500" />}
            label="Active Packages"
            value={stats.activePackages}
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-orange-500" />}
            label="Remaining Sessions"
            value={stats.remainingSessions}

          />
          <StatCard
            icon={<Calendar className="w-6 h-6 text-orange-500" />}
            label="Upcoming Bookings"
            value={stats.upcomingBookings}
          />
          <StatCard
            icon={<Activity className="w-6 h-6 text-orange-500" />}
            label="Total Visits"
            value={stats.totalVisits}
          />
          <StatCard
            icon={<CreditCard className="w-6 h-6 text-orange-500" />}
            label="Membership Status"
            value={paymentStatus}
          />
        </div>



        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Subscription Status */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
              Subscription Status
            </h2>
            <div className="text-center">
              <p className="text-2xl font-bold mb-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-lg ${paymentStatus === "Paid" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {paymentStatus}
                </span>
              </p>
              <p className="text-gray-400">
                Your subscription is currently {paymentStatus}.
              </p>
              {lastPayment && (
                <div className="text-sm text-gray-500 mt-2">
                  Last payment of RWF {lastPayment.amount} on{" "}
                  {new Date(lastPayment.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Upgrade Membership */}
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-500" />
              Upgrade Membership
            </h2>
            <div className="space-y-4">
              <p className="text-gray-400">
                Unlock more benefits by upgrading your membership.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Daily', price: 100, duration: 1 },
                  { name: 'Weekly', price: 200, duration: 7 },
                  { name: 'Monthly', price: 300, duration: 30 },
                  { name: 'Annually', price: 400, duration: 365 },
                ].map((tier) => (
                  <button
                    key={tier.name}
                    onClick={() => {
                      setMembershipType(tier.name.toLowerCase());
                      setPrice(tier.price);
                      setDurationDays(tier.duration);
                    }}
                    className={`px-4 py-2 rounded-md text-sm text-center ${membershipType === tier.name.toLowerCase() ? "bg-orange-500 text-white font-bold" : "bg-gray-800/50 text-gray-300"}`}>
                    {tier.name} ({tier.price} RWF)
                  </button>
                ))}
              </div>
              <FlutterWaveButton
                className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 font-bold"
                {...fwConfig}
                text={`Upgrade to ${membershipType} - ${price} RWF`}
                callback={handlePaymentSuccess}
                onClose={handlePaymentClose}
              />
              {upgradeError && (
                <p className="text-red-400 text-sm text-center">
                  {upgradeError}
                </p>
              )}
            </div>
          </div>
          {/* QR Code Section */}
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Your Membership QR Code</h2>
            <p className="text-gray-400 mb-4">Scan this code at the front desk for check-in.</p>
            <div className="flex justify-center">
            {user && (
              <QRCodeGenerator ref={qrCanvasRef} text={`${user._id || user.id}`} />
            )}
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <button onClick={handleDownload} className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors">
                Download
              </button>
              <button onClick={handlePrint} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                Print
              </button>
            </div>
          </div>

        </div>

        {/* Lower Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Packages */}
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-500" />
              Active Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-white capitalize">
                      {pkg.name}
                    </h3>
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
            <div className="overflow-x-auto">
              {upcomingBookings.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Service</th>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Time</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-700 hover:bg-gray-800/60">
                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap capitalize">{booking.type}</td>
                        <td className="px-6 py-4 text-gray-300">{booking.date}</td>
                        <td className="px-6 py-4 text-gray-300">{booking.time}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize ${
                              booking.status === 'confirmed'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-400 py-4">You have no upcoming bookings.</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-500" />
              Recent Activity
            </h2>
            <div className="overflow-x-auto">
              {recentActivity.length > 0 ? (
                <table className="w-full text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Activity</th>
                      <th scope="col" className="px-6 py-3">Date</th>
                      <th scope="col" className="px-6 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity) => (
                      <tr key={activity.id} className="border-b border-gray-700 hover:bg-gray-800/60">
                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap capitalize">{activity.type}</td>
                        <td className="px-6 py-4 text-gray-300">{activity.date}</td>
                        <td className="px-6 py-4 text-gray-300">{activity.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-400 py-4">No recent activity found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
