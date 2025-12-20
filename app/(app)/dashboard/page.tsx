"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrency, getMonthName } from "@/lib/utils";
import StatisticsDashboardTab from "../statistics/dashboard-tab";
import ExcelImportModal from "@/components/modals/excel-import-modal";

// Chart colors
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];
const PROFIT_COLORS = ["#22c55e", "#ef4444", "#f97316", "#eab308", "#8b5cf6"];

function downloadSvgChart(container: HTMLDivElement | null, filename: string) {
  if (!container) return;
  const svg = container.querySelector("svg");
  if (!svg) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    window.URL.revokeObjectURL(url);

    const imgURI = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = imgURI;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  image.src = url;
}

interface DashboardData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    centerCount: number;
  };
  monthlyTrends: Array<{
    month: number;
    year: number;
    revenue: number;
    expenses: number;
  }>;
  topCenters: Array<{
    centerId: string;
    centerName: string;
    revenue: number;
  }>;
  expenseCategories: Array<{
    categoryName: string;
    amount: number;
  }>;
  profitMargins: Array<{
    centerName: string;
    profitMargin: number;
  }>;
  yearlyComparison: Array<{
    year: number;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);

  const revenueVsExpenseRef = useRef<HTMLDivElement | null>(null);
  const monthlyTrendRef = useRef<HTMLDivElement | null>(null);
  const expenseCategoriesRef = useRef<HTMLDivElement | null>(null);
  const yearlyComparisonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error("Failed to fetch dashboard data:", response.status);
        setData(null);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (
    type: "dashboard" | "summary",
    format: "xlsx" | "csv" = "xlsx"
  ) => {
    try {
      const response = await fetch(`/api/export?type=${type}&format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-${type}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting dashboard data:", error);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang kiểm tra xác thực...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated" || !session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang chuyển hướng...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Không có dữ liệu</div>
      </div>
    );
  }

  const stats =
    data && data.summary
      ? [
          {
            name: "Tổng doanh thu",
            value: formatCurrency(data.summary.totalRevenue || 0),
            icon: TrendingUp,
            color: "text-success-600",
            bgColor: "bg-success-50",
          },
          {
            name: "Tổng chi phí",
            value: formatCurrency(data.summary.totalExpenses || 0),
            icon: TrendingDown,
            color: "text-danger-600",
            bgColor: "bg-danger-50",
          },
          {
            name: "Lợi nhuận",
            value: formatCurrency(data.summary.totalProfit || 0),
            icon: DollarSign,
            color: "text-primary-600",
            bgColor: "bg-primary-50",
          },
          {
            name: "Số trung tâm",
            value: data.summary.centerCount || 0,
            icon: Building2,
            color: "text-gray-600",
            bgColor: "bg-gray-50",
          },
        ]
      : [];

  const monthlyChartData =
    data?.monthlyTrends?.map((item) => ({
      name: `${getMonthName(item.month)} ${item.year}`,
      "Doanh thu": item.revenue,
      "Chi phí": item.expenses,
      "Lợi nhuận": item.revenue - item.expenses,
    })) || [];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Import Options */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tải dữ liệu từ Excel
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Tải lên Excel
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Xuất báo cáo
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport("dashboard", "xlsx")}
            className="btn-primary flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Dashboard Excel
          </button>
          <button
            onClick={() => handleExport("dashboard", "csv")}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Dashboard CSV
          </button>
          <button
            onClick={() => handleExport("summary", "xlsx")}
            className="btn-secondary flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Tổng hợp Excel
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Doanh thu vs Chi phí (12 tháng gần nhất)
            </h3>
            <button
              onClick={() =>
                downloadSvgChart(
                  revenueVsExpenseRef.current,
                  "doanh-thu-chi-phi"
                )
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Tải ảnh
            </button>
          </div>
          <div ref={revenueVsExpenseRef} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="Doanh thu" fill="#22c55e" />
                <Bar dataKey="Chi phí" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Centers */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 trung tâm có doanh thu cao nhất
          </h3>
          <div className="space-y-4">
            {data.topCenters.map((center, index) => (
              <div key={center.centerId} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-700">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {center.centerName}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-sm font-semibold text-success-600">
                    {formatCurrency(center.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend Line Chart with profit */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Xu hướng doanh thu, chi phí và lợi nhuận theo tháng
          </h3>
          <button
            onClick={() =>
              downloadSvgChart(monthlyTrendRef.current, "xu-huong-theo-thang")
            }
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Tải ảnh
          </button>
        </div>
        <div ref={monthlyTrendRef} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Doanh thu"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Chi phí"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Lợi nhuận"
                stroke="#0ea5e9"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Categories Pie Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Chi phí theo danh mục
            </h3>
            <button
              onClick={() =>
                downloadSvgChart(
                  expenseCategoriesRef.current,
                  "chi-phi-danh-muc"
                )
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Tải ảnh
            </button>
          </div>
          {data.expenseCategories && data.expenseCategories.length > 0 ? (
            <div ref={expenseCategoriesRef} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.expenseCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ categoryName, percent }) =>
                      `${categoryName} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {data.expenseCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Không có dữ liệu</div>
            </div>
          )}
        </div>

        {/* Profit Margin by Center */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tỷ suất lợi nhuận theo trung tâm
          </h3>
          {data.profitMargins && data.profitMargins.length > 0 ? (
            <div className="space-y-4">
              {data.profitMargins.map((center, index) => (
                <div
                  key={center.centerName}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-700">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {center.centerName}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        center.profitMargin >= 0
                          ? "text-success-600"
                          : "text-danger-600"
                      }`}
                    >
                      {center.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Không có dữ liệu</div>
            </div>
          )}
        </div>

        {/* Yearly Comparison Area Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              So sánh theo năm
            </h3>
            <button
              onClick={() =>
                downloadSvgChart(
                  yearlyComparisonRef.current,
                  "so-sanh-theo-nam"
                )
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Tải ảnh
            </button>
          </div>
          {data.yearlyComparison && data.yearlyComparison.length > 0 ? (
            <div ref={yearlyComparisonRef} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.yearlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.6}
                    name="Doanh thu"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Chi phí"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stackId="3"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.4}
                    name="Lợi nhuận"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Không có dữ liệu</div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed income dashboard (moved from statistics tab) */}
      <StatisticsDashboardTab />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          fetchDashboardData(); // Refresh dashboard data after import
        }}
      />
    </div>
  );
}

