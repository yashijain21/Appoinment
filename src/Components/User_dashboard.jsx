import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../hooks/useAxiosPublic";

const UserDashboard = () => {
  const axios = useAxiosPublic();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        navigate("/login"); // redirect if not logged in
        return;
      }

      try {
        const res = await axios.get(`/appointments?customerEmail=${userEmail}`);
        setBookings(res.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [axios, navigate]);

  const handleNewBooking = () => {
    window.open(
      "https://darkorchid-dinosaur-751278.hostingersite.com/SteamMaster/services.html",
      "_blank"
    );
  };

  if (loading) return <p className="text-center mt-10">Loading your bookings...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">My Dashboard</h1>

      {/* Profile Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-medium mb-2">Profile</h2>
        <p>Email: {localStorage.getItem("userEmail")}</p>
      </div>

      {/* Previous Bookings */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-medium mb-4">My Bookings</h2>

        {bookings.length === 0 ? (
          <div className="text-center py-6">
            <p className="mb-4 text-gray-500">You have no bookings yet.</p>
            <button
              onClick={handleNewBooking}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              View All Services
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="border rounded-lg p-4 flex justify-between items-start shadow"
              >
                <div>
                  {/* Filter out empty names */}
                  <p className="font-medium">
                    {booking.services.map((s) => s.name).filter(Boolean).join(", ")}
                  </p>
                  <p className="text-gray-500">
                    {new Date(booking.appointmentDate).toLocaleDateString()} at {booking.appointmentTime}
                  </p>
                  <p className="text-gray-500">Status: {booking.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{booking.totalPrice} kr</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Booking Button */}
      {bookings.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={handleNewBooking}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Book New Service
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
