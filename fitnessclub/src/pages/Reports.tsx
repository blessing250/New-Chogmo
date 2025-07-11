import React, { useState } from "react";
import { apiFetch } from "../api";

const Reports: React.FC = () => {
  const [visitHistory, setVisitHistory] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [exporting, setExporting] = useState(false);

  // Fetch visit history
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/auth/export-visit-history", {
        method: "POST",
      });
      setVisitHistory(res.history || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance logs
  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/attendance/me");
      setAttendanceLogs(Array.isArray(res) ? res : res.logs || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch attendance logs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/payments/me");
      setPayments(Array.isArray(res) ? res : res.payments || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  // Send notification
  const sendNotification = async () => {
    if (!notificationMsg) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/auth/notify", {
        method: "POST",
        body: JSON.stringify({ message: notificationMsg }),
        headers: { "Content-Type": "application/json" },
      });
      setNotificationMsg("");
      alert("Notification sent!");
    } catch (err: any) {
      setError(err.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  // Export visit history as PDF
  const exportPDF = async () => {
    setExporting(true);
    setError(null);
    try {
      // Use visitHistory as visits array
      const response = await fetch("/api/auth/export-visit-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visits: visitHistory }),
      });
      if (!response.ok) throw new Error("Failed to export PDF");
      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err: any) {
      setError(err.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-6">
          Reports & Notifications
        </h1>

        {/* Export Visit History */}
        <div className="mb-8 bg-black/60 rounded-2xl p-6 border border-orange-500/20">
          <h2 className="text-xl font-bold text-white mb-4">
            Export Visit History
          </h2>
          <button
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 mb-4"
            onClick={exportPDF}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export as PDF"}
          </button>
          <button
            className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 ml-4"
            onClick={fetchHistory}
            disabled={loading}
          >
            {loading ? "Loading..." : "View History"}
          </button>
          {error && <p className="mt-2 text-red-500">{error}</p>}
          {visitHistory.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg text-orange-400 mb-2">Recent Visits</h3>
              <table className="min-w-full text-left bg-black/40 rounded-lg">
                <thead>
                  <tr className="text-gray-300">
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Service</th>
                    <th className="py-2 px-4">Sessions Used</th>
                  </tr>
                </thead>
                <tbody>
                  {visitHistory.map((visit, idx) => (
                    <tr key={idx} className="border-b border-gray-700">
                      <td className="py-2 px-4 text-white">{visit.date}</td>
                      <td className="py-2 px-4 text-gray-300">
                        {visit.service}
                      </td>
                      <td className="py-2 px-4 text-orange-400">
                        {visit.sessionsUsed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attendance Logs */}
        <div className="mb-8 bg-black/60 rounded-2xl p-6 border border-orange-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Attendance Logs</h2>
          <button
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 mb-4"
            onClick={fetchAttendance}
            disabled={loading}
          >
            {loading ? "Loading..." : "View Attendance"}
          </button>
          {error && <p className="mt-2 text-red-500">{error}</p>}
          {attendanceLogs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg text-orange-400 mb-2">
                Recent Attendance
              </h3>
              <table className="min-w-full text-left bg-black/40 rounded-lg">
                <thead>
                  <tr className="text-gray-300">
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Service</th>
                    <th className="py-2 px-4">Session Used</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.map((log, idx) => (
                    <tr key={idx} className="border-b border-gray-700">
                      <td className="py-2 px-4 text-white">
                        {log.checkInTime}
                      </td>
                      <td className="py-2 px-4 text-gray-300">
                        {log.serviceType}
                      </td>
                      <td className="py-2 px-4 text-orange-400">
                        {log.sessionUsed ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payments */}
        <div className="mb-8 bg-black/60 rounded-2xl p-6 border border-orange-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Payments</h2>
          <button
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 mb-4"
            onClick={fetchPayments}
            disabled={loading}
          >
            {loading ? "Loading..." : "View Payments"}
          </button>
          {error && <p className="mt-2 text-red-500">{error}</p>}
          {payments.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg text-orange-400 mb-2">Recent Payments</h3>
              <table className="min-w-full text-left bg-black/40 rounded-lg">
                <thead>
                  <tr className="text-gray-300">
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Amount</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay, idx) => (
                    <tr key={idx} className="border-b border-gray-700">
                      <td className="py-2 px-4 text-white">{pay.createdAt}</td>
                      <td className="py-2 px-4 text-orange-400">
                        {pay.amount} {pay.currency}
                      </td>
                      <td className="py-2 px-4 text-gray-300">{pay.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Send Notification */}
        <div className="mb-8 bg-black/60 rounded-2xl p-6 border border-orange-500/20">
          <h2 className="text-xl font-bold text-white mb-4">
            Send Notification
          </h2>
          <input
            type="text"
            value={notificationMsg}
            onChange={(e) => setNotificationMsg(e.target.value)}
            placeholder="Type your notification message..."
            className="w-full px-4 py-2 rounded-md border border-orange-500/30 mb-4 bg-black text-white"
          />
          <button
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600"
            onClick={sendNotification}
            disabled={loading || !notificationMsg}
          >
            Send Notification
          </button>
          {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Reports;
