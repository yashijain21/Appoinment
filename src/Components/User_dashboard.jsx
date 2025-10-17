import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../hooks/useAxiosPublic";

const UserDashboard = () => {
  const axios = useAxiosPublic();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      return;
    }

 const fetchBookings = async () => {
  try {
    const res = await axios.get(`/appointments?customerEmail=${userEmail}`);
    const fetchedBookings = res.data;

    // Sort bookings: latest first
    const sortedBookings = fetchedBookings.sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);

      // Compare date first
      if (dateB - dateA !== 0) return dateB - dateA;

      // If same date, compare time (HH:mm)
      const [hoursA, minutesA] = a.appointmentTime.split(":").map(Number);
      const [hoursB, minutesB] = b.appointmentTime.split(":").map(Number);
      return hoursB * 60 + minutesB - (hoursA * 60 + minutesA);
    });

    setBookings(sortedBookings);
    setLoading(false);
      

        const totalPoints = fetchedBookings.reduce((acc, booking) => {
          if (booking.status !== "attended") return acc;
          const services = booking.serviceNames || [];

          services.forEach((name) => {
            const lower = name.toLowerCase();
            if (lower.includes("liten bil")) acc += 20;
            if (lower.includes("sedan")) acc += 20;
            if (lower.includes("suv")) acc += 20;
            if (lower.includes("reconditioning")) acc += 100;
          });

          return acc;
        }, 0);

        const redeemed = parseInt(localStorage.getItem("redeemedPoints") || 0);
        const invited = parseInt(localStorage.getItem("invitePoints") || 0);
        setPoints(totalPoints - redeemed + invited);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [axios, navigate, userEmail]);

  const handleRedeem = (type) => {
    const requiredPoints = type === "wash" ? 100 : 500;
    if (points < requiredPoints) {
      alert("Not enough points to redeem this reward.");
      return;
    }
    localStorage.setItem(
      "redeemedPoints",
      parseInt(localStorage.getItem("redeemedPoints") || 0) + requiredPoints
    );
    setPoints(points - requiredPoints);
    alert(
      type === "wash"
        ? "🎁 You redeemed 100 points for a free car wash!"
        : "🎉 You redeemed 500 points for a full reconditioning service!"
    );
  };

  const handleInvite = () => {
    const friendEmail = prompt("Enter your friend's email:");
    if (!friendEmail) return;
    localStorage.setItem(
      "invitePoints",
      parseInt(localStorage.getItem("invitePoints") || 0) + 50
    );
    setPoints(points + 50);
    alert("✅ Invite sent! You earned 50 points.");
  };

  const handleNewBooking = () => {
    window.open(
      "https://darkorchid-dinosaur-751278.hostingersite.com/SteamMaster/services.html",
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your overview.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Points */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {userEmail?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Your Profile</h3>
                  <p className="text-gray-600 text-sm truncate max-w-[200px]">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Points Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Loyalty Points</h3>
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2">{points}</div>
                <p className="text-blue-100 text-sm">Available Points</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleRedeem("wash")}
                  disabled={points < 100}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Free Car Wash</span>
                  <span className="bg-white bg-opacity-30 rounded-full px-2 py-1 text-xs">
                    100 pts
                  </span>
                </button>
                
                <button
                  onClick={() => handleRedeem("reconditioning")}
                  disabled={points < 500}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Full Reconditioning</span>
                  <span className="bg-white bg-opacity-30 rounded-full px-2 py-1 text-xs">
                    500 pts
                  </span>
                </button>
              </div>
            </div>

            {/* Invite Friend Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <img width="50" height="50" src="https://img.icons8.com/ios/50/invite.png" alt="invite"/>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Invite Friends</h3>
                <p className="text-gray-600 text-sm mb-4">Earn 50 points for each friend who joins</p>
                <button
                  onClick={handleInvite}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Invite a Friend
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
                  <p className="text-gray-600 text-sm">Your appointment history and status</p>
                </div>
                <button
                  onClick={handleNewBooking}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Book New Service</span>
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-500 mb-6">Get started by booking your first service</p>
                  <button
                    onClick={handleNewBooking}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    View All Services
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'attended' 
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {new Date(booking.appointmentDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {booking.services.map((s) => s.name).filter(Boolean).join(", ")}
                          </h4>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{booking.appointmentTime}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 sm:mt-0 sm:text-right">
                          <div className="text-2xl font-bold text-gray-900">{booking.totalPrice} kr</div>
                          <div className="text-sm text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;