import React, { useState, useEffect } from "react";
import { apiFetch } from "../api";

interface ServicePackage {
  _id: string;
  name: string;
}

const availableTimes = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const BookAppointment = () => {
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await apiFetch("/packages");
        setServicePackages(data);
      } catch (err) {
        setError("Failed to fetch service packages.");
        console.error(err);
      }
    };
    fetchPackages();
  }, []);

  const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedPackages((prev) => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter((id) => id !== value);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (selectedPackages.length === 0 || !appointmentDate || !appointmentTime) {
      setError("Please select at least one service, a date, and a time.");
      return;
    }

    try {
      await apiFetch("/appointments/book", {
        method: "POST",
        body: JSON.stringify({
          servicePackageIds: selectedPackages,
          date: appointmentDate,
          time: appointmentTime,
        }),
      });
      setMessage("Appointment booked successfully! You will be notified once it's approved.");
      setSelectedPackages([]);
      setAppointmentDate("");
      setAppointmentTime("");
    } catch (err: any) {
      setError(err.message || "Failed to book appointment.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-black/60 backdrop-blur-lg rounded-2xl p-8 border border-orange-500/20">
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-400">Book an Appointment</h1>
        {message && <div className="bg-green-500/20 text-green-300 p-3 rounded-md mb-4 text-center">{message}</div>}
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Services</label>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 border border-gray-700 rounded-md">
              {servicePackages.length > 0 ? (
                servicePackages.map((pkg) => (
                  <div key={pkg._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={pkg._id}
                      value={pkg._id}
                      onChange={handlePackageChange}
                      checked={selectedPackages.includes(pkg._id)}
                      className="h-4 w-4 bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500 rounded"
                    />
                    <label htmlFor={pkg._id} className="ml-3 text-sm text-gray-300">
                      {pkg.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-2">No services available.</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-400 mb-2">Date</label>
              <input
                type="date"
                id="appointmentDate"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-400 mb-2">Time</label>
              <select
                id="appointmentTime"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                required
              >
                <option value="" disabled>Select a time</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Book Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;

