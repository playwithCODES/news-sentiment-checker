"use client";

export default function Toast({ message, type = "success" }) {
  if (!message) return null;

  const style = type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";

  return <div className={`rounded-lg p-3 ${style}`}>{message}</div>;
}