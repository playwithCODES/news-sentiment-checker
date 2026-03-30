"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import for routing
import { useParams } from "next/navigation"; // Use for dynamic URL params

export default function ResetPassword() {
  const { resetToken } = useParams(); // Correct way to get dynamic route params

  const [newPassword, setNewPassword] = useState(""); // State for new password
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirming password
  const [message, setMessage] = useState(""); // State for success message
  const [error, setError] = useState(""); // State for error message

  // If no reset token is found
  useEffect(() => {
    if (!resetToken) {
      setError("Invalid or expired reset token");
    }
  }, [resetToken]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resetToken, // Include reset token in request
          newPassword,
        }),
      });

      const data = await response.json(); // Get the response data

      if (response.ok) {
        setMessage(data.message); // Display success message
        setTimeout(() => router.push("/login"), 2000); // Redirect to login after success
      } else {
        setError(data.message); // Display error message
      }
    } catch (err) {
      setError("Something went wrong, please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center">Reset Password</h1>
        <p className="mb-4 text-center">Enter your new password below.</p>

        {/* New Password input */}
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
          required
        />

        {/* Confirm Password input */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
          required
        />

        {/* Submit Button */}
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
          Reset Password
        </button>

        {/* Success or Error Message */}
        {message && <p className="mt-4 text-green-500 text-center">{message}</p>}
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
}