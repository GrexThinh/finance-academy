"use client";

import { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";

interface ExpenseModalProps {
  record: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpenseModal({
  record,
  onClose,
  onSuccess,
}: ExpenseModalProps) {
  const [centers, setCenters] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    month: record?.month || new Date().getMonth() + 1,
    year: record?.year || new Date().getFullYear(),
    centerId: record?.center?.id || "",
    category: record?.category?.name || "",
    item: record?.item?.name || "",
    position: record?.position || "",
    contractType: record?.contractType || "",
    hours: record?.hours || "",
    unitPrice: record?.unitPrice || "",
    amount: record?.amount || "",
    kilometers: record?.kilometers || "",
    travelAllowance: record?.travelAllowance || "",
    responsible: record?.responsible || "",
    status: record?.status || "",
    total: record?.total || "",
    notes: record?.notes || "",
    uploadedFileUrl: record?.uploadedFileUrl || "",
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    const response = await fetch("/api/centers");
    const data = await response.json();
    // API returns shape { data: Center[], pagination: ... }
    const centersArray = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];
    setCenters(centersArray);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setFormData((prev) => ({ ...prev, uploadedFileUrl: data.url }));
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Lỗi khi tải file lên");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = "/api/expenses";
      const method = record ? "PUT" : "POST";
      const body = record ? { id: record.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert("Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving record:", error);
      alert("Có lỗi xảy ra");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {record ? "Sửa chi phí" : "Thêm chi phí mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tháng</label>
              <select
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: parseInt(e.target.value) })
                }
                className="input"
                required
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Năm</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Trung tâm</label>
            <select
              value={formData.centerId}
              onChange={(e) =>
                setFormData({ ...formData, centerId: e.target.value })
              }
              className="input"
              required
            >
              <option value="">Chọn trung tâm</option>
              {centers &&
                centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Khoản chi</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input"
                placeholder="Nhập khoản chi"
                required
              />
            </div>

            <div>
              <label className="label">Hạng mục</label>
              <input
                type="text"
                value={formData.item}
                onChange={(e) =>
                  setFormData({ ...formData, item: e.target.value })
                }
                className="input"
                placeholder="Nhập hạng mục"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Chức vụ</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="label">Loại hợp đồng</label>
              <input
                type="text"
                value={formData.contractType}
                onChange={(e) =>
                  setFormData({ ...formData, contractType: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Số giờ</label>
              <input
                type="number"
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: e.target.value })
                }
                className="input"
                step="0.01"
              />
            </div>

            <div>
              <label className="label">Đơn giá (VNĐ)</label>
              <input
                type="number"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: e.target.value })
                }
                className="input"
                step="1000"
              />
            </div>
          </div>

          <div>
            <label className="label">Thành tiền (VNĐ)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="input"
              required
              step="1000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Số KM</label>
              <input
                type="number"
                value={formData.kilometers}
                onChange={(e) =>
                  setFormData({ ...formData, kilometers: e.target.value })
                }
                className="input"
                step="0.1"
              />
            </div>

            <div>
              <label className="label">PC di chuyển (VNĐ)</label>
              <input
                type="number"
                value={formData.travelAllowance}
                onChange={(e) =>
                  setFormData({ ...formData, travelAllowance: e.target.value })
                }
                className="input"
                step="1000"
              />
            </div>
          </div>

          <div>
            <label className="label">Phụ trách</label>
            <input
              type="text"
              value={formData.responsible}
              onChange={(e) =>
                setFormData({ ...formData, responsible: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Tình trạng</label>
            <input
              type="text"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="input"
              placeholder="Ví dụ: Đã chi, Chưa chi"
            />
          </div>

          <div>
            <label className="label">Tổng (VNĐ)</label>
            <input
              type="number"
              value={formData.total}
              onChange={(e) =>
                setFormData({ ...formData, total: e.target.value })
              }
              className="input"
              required
              step="1000"
            />
          </div>

          <div>
            <label className="label">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="input"
              rows={3}
            />
          </div>

          <div>
            <label className="label">Tải file đính kèm</label>
            <div className="mt-1">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.pdf"
                className="hidden"
                id="file-upload-expense"
              />
              <label
                htmlFor="file-upload-expense"
                className="btn-secondary cursor-pointer inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Đang tải..." : "Chọn file"}
              </label>
              {formData.uploadedFileUrl && (
                <p className="text-sm text-success-600 mt-2">
                  ✓ File đã được tải lên
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              {record ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
