"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Download } from "lucide-react";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { useDragScroll } from "@/lib/use-drag-scroll";
import ExpenseModal from "@/components/modals/expense-modal";

interface ExpenseRecord {
  id: string;
  month: number;
  year: number;
  center: { id: string; name: string };
  category: string;
  item: string;
  position?: string;
  contractType?: string;
  hours?: string;
  unitPrice?: string;
  amount: string;
  kilometers?: string;
  travelAllowance?: string;
  responsible?: string;
  status?: string;
  total: string;
  notes?: string;
}

export default function ExpensesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(
    null
  );

  // Filter state
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

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
    fetchCenters();
  }, [status, session, router]);

  const fetchRecords = async (page = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/expenses?${params}`);
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
      console.error("Error fetching expense records:", error);
      setRecords([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await fetch("/api/centers");
      if (response.ok) {
        const data = await response.json();
        setCenters(Array.isArray(data) ? data : []);
      } else {
        console.error("API error:", response.status, response.statusText);
        setCenters([]);
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
      setCenters([]);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ type: "expense" });
      if (selectedYear) params.append("year", selectedYear);

      const response = await fetch(`/api/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chi-phi-${Date.now()}.xlsx`;
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
      await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      // If we're on a page that will be empty after deletion, go to previous page
      const newTotalCount = totalCount - 1;
      const newTotalPages = Math.ceil(newTotalCount / itemsPerPage);
      const pageToFetch =
        currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
      fetchRecords(pageToFetch);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  // Calculate totals from current page data
  const totals = records.reduce(
    (acc, record) => ({
      amount: acc.amount + parseFloat(record.amount),
      total: acc.total + parseFloat(record.total),
      count: acc.count + 1,
    }),
    { amount: 0, total: 0, count: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý chi phí</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý chi phí từ các trung tâm
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

      {/* Summary Totals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng số bản ghi
              </p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số tiền</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(totals.amount.toString())}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold text-danger-600">
                {formatCurrency(totals.total.toString())}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Trung bình/bản ghi
              </p>
              <p className="text-2xl font-bold text-primary-600">
                {totals.count > 0
                  ? formatCurrency((totals.total / totals.count).toString())
                  : formatCurrency("0")}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                  Thời gian
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Trung tâm
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Khoản chi
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Hạng mục
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Số tiền
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tổng
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-2 text-center text-gray-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
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
                      {record.center.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {record.category}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {record.item}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-danger-600">
                      {formatCurrency(record.total)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
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

      {modalOpen && (
        <ExpenseModal
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
