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

  // New spreadsheet fields
  tuitionFeeFullYear?: string;
  tuitionFeeHalfYear?: string;
  tuitionFeeDiscount?: string;
  tuitionFeeOld?: string;
  sessionCount?: number;
  sessionCountNew?: number;
  numClassesHalfFee?: number;
  numClassesFullFee?: number;
  numStudentsHalfFee?: number;
  numStudentsFullFee?: number;
  numDiscountedStudents?: number;
  discount?: string;
  payType?: string;
  oldStudent?: string;
  freeStudentCount?: number;
  totalTuitionFee?: string;
  facilitiesFee?: string;
  adminDeduction?: string;
  agentCommission?: string;
  teacherDeduction?: string;
  totalDeduction?: string;
  actualReceivable?: string;
  submittedToCenter?: string;
  collectionDate?: string | null;
  difference?: string;
  selfEnrollCount?: number;
  retentionRate?: string;
  staffInvolved?: string;
  hrRetention?: string;
  hrContract?: string;
  schoolDeductionMethod?: string;
  centerDeductionMethod?: string;
  contractStatus?: string;
  teacherRate?: string;
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

  // Pagination state
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
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    fetchRecords(1); // Reset to page 1 when component mounts
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchRecords(1); // Reset to page 1 when year filter changes
    }
  }, [selectedYear]);

  const fetchRecords = async (page = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (selectedYear) params.append("year", selectedYear);

      const response = await fetch(`/api/income?${params}`);
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
      console.error("Error fetching income records:", error);
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
      // If we're on a page that will be empty after deletion, go to previous page
      const newTotalCount = totalCount - 1;
      const newTotalPages = Math.ceil(newTotalCount / itemsPerPage);
      const pageToFetch = currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
      fetchRecords(pageToFetch);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  // Records are now filtered server-side, so we use them directly

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
          className={`overflow-x-auto ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } select-none`}
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
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                records.map((record) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} của {totalCount} kết quả
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

              {/* Page numbers */}
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
            fetchRecords(1); // Reset to page 1 after create/update
          }}
        />
      )}
    </div>
  );
}

