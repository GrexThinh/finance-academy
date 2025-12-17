import { useEffect, useMemo, useState } from "react";
import { Download, Filter } from "lucide-react";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { useDragScroll } from "@/lib/use-drag-scroll";

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

interface Center {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
}

export default function StatisticsTab() {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const {
    ref: tableRef,
    isDragging,
    handlers,
  } = useDragScroll({ dragSpeed: 2 });

  useEffect(() => {
    fetchOptions();
    fetchRecords(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRecords(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, selectedCenter, selectedProgram]);

  const fetchOptions = async () => {
    try {
      const [centersRes, programsRes] = await Promise.all([
        fetch("/api/centers?limit=1000"),
        fetch("/api/programs?limit=1000"),
      ]);

      if (centersRes.ok) {
        const centersJson = await centersRes.json();
        setCenters(Array.isArray(centersJson.data) ? centersJson.data : []);
      }

      if (programsRes.ok) {
        const programsJson = await programsRes.json();
        setPrograms(Array.isArray(programsJson.data) ? programsJson.data : []);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
      setCenters([]);
      setPrograms([]);
    }
  };

  const fetchRecords = async (page = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (selectedYear) params.append("year", selectedYear);
      if (selectedMonth) params.append("month", selectedMonth);
      if (selectedCenter) params.append("centerId", selectedCenter);
      if (selectedProgram) params.append("programId", selectedProgram);

      const response = await fetch(`/api/income?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setRecords(Array.isArray(result.data) ? result.data : []);
        setTotalCount(result.pagination?.totalCount || 0);
        setTotalPages(result.pagination?.totalPages || 0);
        setCurrentPage(page);
      } else {
        console.error("API error:", response.status, response.statusText);
        setRecords([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching statistics records:", error);
      setRecords([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ type: "income" });
      if (selectedYear) params.append("year", selectedYear);
      if (selectedMonth) params.append("month", selectedMonth);
      if (selectedCenter) params.append("centerId", selectedCenter);
      if (selectedProgram) params.append("programId", selectedProgram);

      const response = await fetch(`/api/export?${params.toString()}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thong-ke-doanh-thu-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting statistics:", error);
    }
  };

  const years = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.year)))
        .sort((a, b) => b - a)
        .map((y) => y.toString()),
    [records]
  );

  const totals = useMemo(
    () =>
      records.reduce(
        (acc, record) => ({
          classes: acc.classes + (record.numberOfClasses || 0),
          students: acc.students + (record.numberOfStudents || 0),
          revenue: acc.revenue + Number(record.revenue || 0),
        }),
        { classes: 0, students: 0, revenue: 0 }
      ),
    [records]
  );

  return (
    <div className="space-y-6">
      {/* Header + Export specific to statistics tab */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Thống kê doanh thu
          </h2>
          <p className="text-gray-600 mt-1 text-sm">
            Tổng hợp số lớp, số học viên và doanh thu theo trung tâm, chương
            trình.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
          <Filter className="w-4 h-4" />
          <span>Bộ lọc thống kê</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Năm
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input"
            >
              <option value="">Tất cả năm</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Tháng
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input"
            >
              <option value="">Tất cả tháng</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Trung tâm
            </label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả trung tâm</option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Chương trình
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="input"
            >
              <option value="">Tất cả chương trình</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Tổng số bản ghi</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalCount}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Tổng số lớp</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totals.classes}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">
            Tổng số học viên / Doanh thu
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {totals.students.toLocaleString()} học viên
          </p>
          <p className="text-2xl font-bold text-success-600">
            {formatCurrency(totals.revenue.toString())}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div
          ref={tableRef}
          className={`overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } select-none`}
          {...handlers}
        >
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tháng
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Trung tâm
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Chương trình
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Số lớp
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Số học viên
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-2 text-center text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-2 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {getMonthName(record.month)} {record.year}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {record.center?.name || "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {record.program?.name || "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      {record.numberOfClasses}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      {record.numberOfStudents}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-semibold text-success-600">
                      {formatCurrency(record.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} của{" "}
                {totalCount} kết quả
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchRecords(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchRecords(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === pageNum
                        ? "bg-primary-600 text-white border-primary-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => fetchRecords(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

