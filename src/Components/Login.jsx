import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";

export default function OtpLogin() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const navigate = useNavigate();

  // Step 1: Send OTP via EmailJS
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    const templateParams = { email, otp: newOtp };

    try {
      await emailjs.send(
        "service_zg31ikj", // replace with your EmailJS service ID
        "template_6godrxg", // replace with your EmailJS template ID
        templateParams,
        "C9iKw6EUjCLCeQu5_" // replace with your EmailJS public key
      );
      alert("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      console.error("EmailJS error:", error);
      alert("Failed to send OTP, try again.");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      alert("Login successful!");
      localStorage.setItem("userEmail", email); // store logged-in email
      navigate("/dashboard"); // redirect to dashboard
    } else {
      alert("Invalid OTP, try again!");
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#080710] relative overflow-hidden px-4">
      {/* Background Shapes */}
      <div className="absolute w-[430px] h-[520px] flex items-center justify-center">
        <div className="absolute h-[200px] w-[200px] rounded-full bg-gradient-to-b from-[#1845ad] to-[#23a2f6] -left-20 -top-20"></div>
        <div className="absolute h-[200px] w-[200px] rounded-full bg-gradient-to-r from-[#ff512f] to-[#f09819] -right-8 -bottom-20"></div>
      </div>

      {/* OTP Login Form */}
      <form className="relative w-full max-w-sm sm:max-w-md bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(8,7,16,0.6)] p-8 sm:p-10 z-10">
        <h3 className="text-2xl sm:text-3xl font-medium text-white text-center mb-6">
          {step === 1 ? "Login with Email" : "Enter OTP"}
        </h3>

        {step === 1 ? (
          <>
            <label htmlFor="email" className="block text-white font-medium mt-6 text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 mt-2 px-3 rounded bg-white/10 text-white text-sm placeholder-gray-300 focus:outline-none"
            />
            <button
              onClick={handleSendOtp}
              className="w-full mt-10 py-3 bg-white text-[#080710] text-lg font-semibold rounded-md cursor-pointer hover:bg-gray-200 transition"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <label htmlFor="otp" className="block text-white font-medium mt-6 text-sm sm:text-base">
              OTP
            </label>
            <input
              type="text"
              id="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full h-12 mt-2 px-3 rounded bg-white/10 text-white text-sm placeholder-gray-300 focus:outline-none"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full mt-10 py-3 bg-white text-[#080710] text-lg font-semibold rounded-md cursor-pointer hover:bg-gray-200 transition"
            >
              Verify & Login
            </button>
          </>
        )}
      </form>
    </div>
  );
}
