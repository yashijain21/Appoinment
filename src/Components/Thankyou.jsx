import React from "react";
import { FiCheckCircle } from "react-icons/fi";// Optional icon library
import { Link } from "react-router-dom";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-lg text-center">
        <FiCheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-4">
          Your booking has been confirmed. A confirmation email with your invoice has been sent to your registered email.
        </p>

        <div className="text-left text-sm bg-gray-100 p-4 rounded-lg mb-6">
          <p><strong>SteamMaster</strong></p>
          <p>Bleckvarugatan 3, 417 07 Göteborg, Sweden</p>
          <p>Phone: +46 76 556 67 75</p>
        </div>

        <Link
          to="https://salmon-sparrow-489592.hostingersite.com/Steam%20Master/index.html"
          className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-all"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default ThankYou;
