"use client";

import { useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setError("");

    if (!email.trim()) {
      toast.error("Please enter your email");
      setError("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const successMessage =
          data.message || "Reset link sent to your email";

        toast.success(successMessage, {
          onOpen: () => {
            setLoading(false);
          },
        });

        setMessage(successMessage);
        setEmail("");
      } else {
        const errorMessage =
          data.message || "Failed to send reset link";

        toast.error(errorMessage, {
          onOpen: () => {
            setLoading(false);
          },
        });

        setError(errorMessage);
      }
    } catch (error) {
      const errorMessage = "Something went wrong, please try again.";

      toast.error(errorMessage, {
        onOpen: () => {
          setLoading(false);
        },
      });

      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleForgotPassword}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-2xl font-bold text-center">
          Forgot Password
        </h1>

        <p className="mb-4 text-center text-gray-600">
          Enter your email to receive a password reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>

        {message && (
          <p className="mt-4 text-green-500 text-center">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-red-500 text-center">
            {error}
          </p>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </div>
  );
}