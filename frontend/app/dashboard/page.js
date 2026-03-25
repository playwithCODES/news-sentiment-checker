"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AnalysisForm from "@/components/AnalysisForm";
import ResultCard from "@/components/ResultCard";
import HistoryTable from "@/components/HistoryTable";
import SentimentChart from "@/components/SentimentChart";
import StatsCards from "@/components/StatsCards";
import FiltersBar from "@/components/FiltersBar";
import api from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();

  const [latestResult, setLatestResult] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState({
    Positive: 0,
    Negative: 0,
    Neutral: 0,
    total: 0
  });

  const [filters, setFilters] = useState({
    search: "",
    sentiment: "",
    category: ""
  });

  const fetchAnalyses = async () => {
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/analysis?${params}`);
      setAnalyses(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/analysis/stats");
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchStats();
  }, [router]);

  useEffect(() => {
    if (isLoggedIn()) fetchAnalyses();
  }, [filters]);

  const handleSuccess = (result) => {
    setLatestResult(result);
    fetchAnalyses();
    fetchStats();
  };

  const downloadFile = async (type) => {
    try {
      const response = await api.get(`/analysis/export/${type}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        type === "csv" ? "analysis-history.csv" : "analysis-report.pdf"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <StatsCards stats={stats} />

        <div className="grid gap-6 lg:grid-cols-2">
          <AnalysisForm onSuccess={handleSuccess} />
          <ResultCard result={latestResult} />
        </div>

        <SentimentChart stats={stats} />

        <FiltersBar
          filters={filters}
          setFilters={setFilters}
          onExportCsv={() => downloadFile("csv")}
          onExportPdf={() => downloadFile("pdf")}
        />

        <HistoryTable analyses={analyses} />
      </main>
    </div>
  );
}