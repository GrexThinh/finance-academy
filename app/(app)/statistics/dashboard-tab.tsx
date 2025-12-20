"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
} from "recharts";
import { formatCurrency, getMonthName } from "@/lib/utils";

interface IncomeRecord {
  id: string;
  month: number;
  year: number;
  center: { id: string; name: string };
  program: { id: string; name: string };
  numberOfClasses: number;
  numberOfStudents: number;
  revenue: string;
}

const CHART_COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#6366f1", "#ec4899", "#14b8a6"];

function downloadSvgChart(container: HTMLDivElement | null, filename: string) {
  if (!container) return;
  const svg = container.querySelector("svg");
  if (!svg) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    URL.revokeObjectURL(url);

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

export default function StatisticsDashboardTab() {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");

  const revenueByMonthRef = useRef<HTMLDivElement | null>(null);
  const revenueByCenterRef = useRef<HTMLDivElement | null>(null);
  const revenueByProgramRef = useRef<HTMLDivElement | null>(null);
  const classesByMonthRef = useRef<HTMLDivElement | null>(null);
  const studentsByMonthRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, selectedCenter, selectedProgram]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: "1", limit: "1000" });
      if (selectedYear) params.append("year", selectedYear);
      if (selectedMonth) params.append("month", selectedMonth);
      if (selectedCenter) params.append("centerId", selectedCenter);
      if (selectedProgram) params.append("programId", selectedProgram);

      const response = await fetch(`/api/income?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setRecords(Array.isArray(result.data) ? result.data : []);
      } else {
        console.error("API error:", response.status, response.statusText);
        setRecords([]);
      }
    } catch (error) {
      console.error("Error fetching income records for dashboard:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const years = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.year)))
        .sort((a, b) => b - a)
        .map((y) => y.toString()),
    [records]
  );

  const centers = useMemo(
    () =>
      Array.from(
        new Map(records.map((r) => [r.center.id, r.center.name])).entries()
      ),
    [records]
  );

  const programs = useMemo(
    () =>
      Array.from(
        new Map(records.map((r) => [r.program.id, r.program.name])).entries()
      ),
    [records]
  );

  const totalRevenue = useMemo(
    () =>
      records.reduce(
        (sum, r) => sum + Number(r.revenue || 0),
        0
      ),
    [records]
  );

  const revenueByCenter = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      const key = r.center.name;
      map.set(key, (map.get(key) || 0) + Number(r.revenue || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [records]);

  const revenueByProgram = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((r) => {
      const key = r.program.name;
      map.set(key, (map.get(key) || 0) + Number(r.revenue || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [records]);

  const classesByMonth = useMemo(() => {
    const map = new Map<string, { name: string; classes: number }>();
    records.forEach((r) => {
      const key = `${r.year}-${r.month}`;
      const label = `${getMonthName(r.month)} ${r.year}`;
      const existing = map.get(key);
      if (existing) {
        existing.classes += r.numberOfClasses || 0;
      } else {
        map.set(key, { name: label, classes: r.numberOfClasses || 0 });
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [records]);

  const studentsByMonth = useMemo(() => {
    const map = new Map<string, { name: string; students: number }>();
    records.forEach((r) => {
      const key = `${r.year}-${r.month}`;
      const label = `${getMonthName(r.month)} ${r.year}`;
      const existing = map.get(key);
      if (existing) {
        existing.students += r.numberOfStudents || 0;
      } else {
        map.set(key, { name: label, students: r.numberOfStudents || 0 });
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [records]);

  const revenueByMonth = useMemo(() => {
    const map = new Map<
      string,
      { name: string; revenue: number; classes: number; students: number }
    >();

    records.forEach((r) => {
      const key = `${r.year}-${r.month}`;
      const label = `${getMonthName(r.month)} ${r.year}`;
      const revenue = Number(r.revenue || 0);
      const existing = map.get(key);
      if (existing) {
        existing.revenue += revenue;
        existing.classes += r.numberOfClasses || 0;
        existing.students += r.numberOfStudents || 0;
      } else {
        map.set(key, {
          name: label,
          revenue,
          classes: r.numberOfClasses || 0,
          students: r.numberOfStudents || 0,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Top summary + filters panel (left) and total revenue card (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
        {/* Filter panel similar to Excel slicers */}
        <div className="card space-y-4">
          <h2 className="text-base font-semibold text-gray-900">
            Bộ lọc tổng quan
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Năm</p>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="input text-sm"
              >
                <option value="">Tất cả</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Tháng</p>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input text-sm"
              >
                <option value="">Tất cả</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Trung tâm
              </p>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="input text-sm"
              >
                <option value="">Tất cả</option>
                {centers.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Chương trình
              </p>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="input text-sm"
              >
                <option value="">Tất cả</option>
                {programs.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Total revenue card */}
        <div className="card flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
            <p className="mt-4 text-3xl font-bold text-primary-600">
              {formatCurrency(totalRevenue.toString())}
            </p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Dữ liệu được tính theo bộ lọc đã chọn.
          </p>
        </div>
      </div>

      {/* Big revenue trend chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Doanh thu, số lớp và học viên theo tháng
          </h3>
          <button
            onClick={() =>
              downloadSvgChart(revenueByMonthRef.current, "tong-hop-theo-thang")
            }
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Tải ảnh
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-80 text-gray-500">
            Đang tải...
          </div>
        ) : revenueByMonth.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-gray-500">
            Không có dữ liệu
          </div>
        ) : (
          <div ref={revenueByMonthRef} className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, key) =>
                    key === "Doanh thu"
                      ? formatCurrency(Number(value))
                      : value
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="classes"
                  name="Số lớp"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="students"
                  name="Số học viên"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Other charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue by center (bar) */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Tổng doanh thu theo trung tâm
            </h3>
            <button
              onClick={() =>
                downloadSvgChart(revenueByCenterRef.current, "doanh-thu-trung-tam")
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Tải ảnh
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Đang tải...
            </div>
          ) : revenueByCenter.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Không có dữ liệu
            </div>
          ) : (
            <div ref={revenueByCenterRef} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByCenter}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Revenue by program (pie) */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Cơ cấu doanh thu theo chương trình
            </h3>
            <button
              onClick={() =>
                downloadSvgChart(revenueByProgramRef.current, "doanh-thu-chuong-trinh")
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Tải ảnh
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Đang tải...
            </div>
          ) : revenueByProgram.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Không có dữ liệu
            </div>
          ) : (
            <div ref={revenueByProgramRef} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByProgram}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {revenueByProgram.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
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
          )}
        </div>

        {/* Classes by month (line chart) */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Tổng số lớp theo tháng
            </h3>
            <button
              onClick={() =>
                downloadSvgChart(classesByMonthRef.current, "so-lop-theo-thang")
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Tải ảnh
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Đang tải...
            </div>
          ) : classesByMonth.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Không có dữ liệu
            </div>
          ) : (
            <div ref={classesByMonthRef} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={classesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="classes"
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Students by month (line chart) */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Tổng số học viên theo tháng
            </h3>
            <button
              onClick={() =>
                downloadSvgChart(
                  studentsByMonthRef.current,
                  "so-hoc-vien-theo-thang"
                )
              }
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Tải ảnh
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Đang tải...
            </div>
          ) : studentsByMonth.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Không có dữ liệu
            </div>
          ) : (
            <div ref={studentsByMonthRef} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

