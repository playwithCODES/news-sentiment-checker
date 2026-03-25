"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HistoryTable from "@/components/HistoryTable";
import FiltersBar from "@/components/FiltersBar";
import api from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();

  const [analyses, setAnalyses] = useState([]);
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

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchAnalyses();
  }, [filters]);

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
        <h1 className="text-2xl font-bold">Analysis History</h1>

        <FiltersBar
          filters={filters}
          setFilters={setFilters}
          onExportCsv={() => downloadFile("csv")}
          onExportPdf={() => downloadFile("pdf")}
        />

       <HistoryTable analyses={analyses} setAnalyses={setAnalyses} />
      </main>
    </div>
  );
}