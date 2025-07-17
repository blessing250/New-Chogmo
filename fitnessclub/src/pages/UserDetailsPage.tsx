import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../context/AuthContext";

const UserDetailsPage: React.FC = () => {
  const { userID } = useParams<{ userID: string }>();
  const { user: adminUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceMessage, setAttendanceMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!adminUser || adminUser.role !== 'admin') {
        setError("Access Denied: Only admins can view this page.");
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch(`/auth/user/${userID}`);
        setUser(data);
      } catch (err) {
        setError("Failed to fetch user details.");
      }
      setLoading(false);
    };

    fetchUser();
  }, [userID, adminUser]);

  const handleMarkAttendance = async () => {
    try {
      await apiFetch('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({ userId: userID, date: new Date().toISOString().split('T')[0] }),
      });
      setAttendanceMessage('Attendance marked successfully!');
    } catch (err) {
      setAttendanceMessage('Failed to mark attendance.');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-8">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto bg-black/60 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-orange-500">User Details</h1>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Name:</p>
            <p className="text-lg">{user.name}</p>
          </div>
          <div>
            <p className="font-semibold">Email:</p>
            <p className="text-lg">{user.email}</p>
          </div>
          <div>
            <p className="font-semibold">Membership Status:</p>
            <p className={`text-lg font-bold ${user.membership === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
              {user.membership === 'paid' ? 'Paid' : 'Not Paid'}
            </p>
          </div>
          {user.membership === 'paid' && (
            <button
              onClick={handleMarkAttendance}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
            >
              Mark Attendance
            </button>
          )}
          {attendanceMessage && (
            <p className="text-center mt-4">{attendanceMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
