"use client";

import { useState } from "react";
import ProfitLossPage from "../profit-loss/page";
import StatisticsTab from "./statistics-tab";

type TabKey = "statistics" | "profit";

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("statistics");

  return (
    <div className="space-y-6">
      {/* Tabs header */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("statistics")}
            className={`whitespace-nowrap pb-2 border-b-2 text-sm font-medium ${
              activeTab === "statistics"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Thống kê doanh thu
          </button>
          <button
            onClick={() => setActiveTab("profit")}
            className={`whitespace-nowrap pb-2 border-b-2 text-sm font-medium ${
              activeTab === "profit"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Phân tích lợi nhuận/Lỗ
          </button>
        </nav>
      </div>

      {/* Active tab content */}
      {activeTab === "statistics" && <StatisticsTab />}
      {activeTab === "profit" && <ProfitLossPage />}
    </div>
  );
}

