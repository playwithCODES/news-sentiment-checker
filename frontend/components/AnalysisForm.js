"use client";

import { useState } from "react";
import api from "@/lib/api";
import Toast from "./Toast";

export default function AnalysisForm({ onSuccess }) {
  const [form, setForm] = useState({
    headline: "",
    content: "",
    sourceUrl: ""
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ message: "", type: "success" });

    if (!form.sourceUrl && (!form.headline || !form.content)) {
      setToast({
        message: "Enter headline and content, or provide a news URL",
        type: "error"
      });
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/analysis", form);
      setForm({ headline: "", content: "", sourceUrl: "" });
      setToast({ message: "News analyzed successfully", type: "success" });
      onSuccess(data);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Analysis failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 rounded-2xl p-6 shadow">
      <h2 className="text-xl font-semibold">Analyze News</h2>

      <Toast message={toast.message} type={toast.type} />

      <input
        type="text"
        name="headline"
        placeholder="Enter news headline"
        value={form.headline}
        onChange={handleChange}
      />

      <textarea
        name="content"
        rows="6"
        placeholder="Paste news content here"
        value={form.content}
        onChange={handleChange}
      />

      <input
        type="text"
        name="sourceUrl"
        placeholder="Optional source URL (you can use only URL too)"
        value={form.sourceUrl}
        onChange={handleChange}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Analyzing..." : "Analyze Sentiment"}
      </button>
    </form>
  );
}