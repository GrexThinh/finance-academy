"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Download, Search, Filter } from "lucide-react";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { useDragScroll } from "@/lib/use-drag-scroll";
import IncomeModal from "@/components/modals/income-modal";

interface IncomeRecord {
  id: string;
  month: number;
  year: number;
  center: { id: string; name: string };
  program: { id: string; name: string };
  partner?: { id: string; name: string } | null;
  numberOfClasses: number;
  numberOfStudents: number;
  revenue: string;
  status?: string;
  notes?: string;
  uploadedFileUrl?: string;
}

export default function IncomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const { ref: tableRef, isDragging, handlers } = useDragScroll({ dragSpeed: 2 });

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    fetchRecords();
  }, [status, session, router]);

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/income");
      if (response.ok) {
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      } else {
        console.error("API error:", response.status, response.statusText);
        setRecords([]);
      }
    } catch (error) {
      console.error("Error fetching income records:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ type: "income" });
      if (selectedYear) params.append("year", selectedYear);

      const response = await fetch(`/api/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thu-nhap-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) return;

    try {
      await fetch(`/api/income?id=${id}`, { method: "DELETE" });
      fetchRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      (record.center?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (record.program?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesYear =
      !selectedYear || record.year.toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

  const years = Array.from(new Set(records.map((r) => r.year))).sort(
    (a, b) => b - a
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thu nhập</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý doanh thu từ các trung tâm
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
          <button
            onClick={() => {
              setEditingRecord(null);
              setModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo trung tâm hoặc chương trình..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
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
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div
          ref={tableRef}
          className={`overflow-x-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
          {...handlers}
        >
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trung tâm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chương trình
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đối tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getMonthName(record.month)} {record.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.center?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.program?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.partner?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.numberOfClasses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.numberOfStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600">
                      {formatCurrency(record.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingRecord(record);
                            setModalOpen(true);
                          }}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-danger-600 hover:text-danger-700 font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <IncomeModal
          record={editingRecord}
          onClose={() => {
            setModalOpen(false);
            setEditingRecord(null);
          }}
          onSuccess={() => {
            setModalOpen(false);
            setEditingRecord(null);
            fetchRecords();
          }}
        />
      )}
    </div>
  );
}
