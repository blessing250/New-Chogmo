import React from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/admin", label: "Overview", icon: "🏠" },
  { to: "/reports", label: "Reports", icon: "📊" },
  { to: "/service-packages", label: "Service Packages", icon: "📦" },
  { to: "/appointments", label: "Appointments", icon: "📅" },
  { to: "/payments", label: "Payments", icon: "💳" },
  { to: "/attendance", label: "Attendance", icon: "🕒" },
];

const AdminDashboard: React.FC = ({ children }) => {
  const location = useLocation();
  const [stats, setStats] = React.useState<any>(null);
  const [members, setMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/auth/stats", { credentials: "include" }).then((r) =>
        r.json()
      ),
      fetch("/api/members", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([statsRes, membersRes]) => {
        setStats(statsRes);
        setMembers(membersRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-black/80 border-r border-orange-500/20 flex flex-col py-8 px-4">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-orange-500">
            Admin Panel
          </span>
        </div>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors duration-200
                ${
                  location.pathname === link.to
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-orange-400 hover:bg-orange-500/20 hover:text-white"
                }
              `}
            >
              <span className="text-xl">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome, Admin</h1>
          <p className="text-gray-400">
            System overview, manage users, services, bookings, and more.
          </p>
        </div>
        {/* Dashboard Stats */}
        <div className="bg-black/60 rounded-2xl p-8 border border-orange-500/20 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">
            Dashboard Overview
          </h2>
          {loading ? (
            <p className="text-gray-300">Loading stats...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-black/80 rounded-xl p-6 border border-orange-500/30">
                <p className="text-gray-400 text-sm">Total Members</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalMembers}
                </p>
              </div>
              <div className="bg-black/80 rounded-xl p-6 border border-orange-500/30">
                <p className="text-gray-400 text-sm">Paid Members</p>
                <p className="text-3xl font-bold text-white">
                  {stats.paidMembers}
                </p>
              </div>
              <div className="bg-black/80 rounded-xl p-6 border border-orange-500/30">
                <p className="text-gray-400 text-sm">Unpaid Members</p>
                <p className="text-3xl font-bold text-white">
                  {stats.unpaidMembers}
                </p>
              </div>
              <div className="bg-black/80 rounded-xl p-6 border border-orange-500/30">
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-orange-500">
                  {stats.totalRevenue} RWF
                </p>
              </div>
            </div>
          ) : null}
        </div>
        {/* Members Table */}
        <div className="bg-black/60 rounded-2xl p-8 border border-orange-500/20 shadow-lg">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">
            All Members
          </h2>
          {loading ? (
            <p className="text-gray-300">Loading members...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium py-2">
                      Name
                    </th>
                    <th className="text-left text-gray-400 font-medium py-2">
                      Email
                    </th>
                    <th className="text-left text-gray-400 font-medium py-2">
                      Type
                    </th>
                    <th className="text-left text-gray-400 font-medium py-2">
                      Status
                    </th>
                    <th className="text-left text-gray-400 font-medium py-2">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member._id || member.id}
                      className="border-b border-gray-800"
                    >
                      <td className="py-3 text-white">{member.name}</td>
                      <td className="py-3 text-gray-400">{member.email}</td>
                      <td className="py-3 text-orange-400">
                        {member.membershipType}
                      </td>
                      <td className="py-3 text-orange-500">
                        {member.membershipStatus}
                      </td>
                      <td className="py-3 text-gray-400">
                        {new Date(member.joinDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminDashboard;
