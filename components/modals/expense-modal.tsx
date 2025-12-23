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
  const [items, setItems] = useState<any[]>([]);
  const [responsiblePersons, setResponsiblePersons] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    month: record?.month || new Date().getMonth() + 1,
    year: record?.year || new Date().getFullYear(),
    centerId: record?.center?.id || "",
    category: record?.category || "",
    itemId: record?.item?.id || "",
    position: record?.position || "",
    contractType: record?.contractType || "",
    hours: record?.hours || "",
    unitPrice: record?.unitPrice || "",
    amount: record?.amount || "",
    kilometers: record?.kilometers || "",
    travelAllowance: record?.travelAllowance || "",
    responsibleId: record?.responsible?.id || "",
    status: record?.status || "",
    total: record?.total || "",
    notes: record?.notes || "",
    uploadedFileUrl: record?.uploadedFileUrl || "",
  });

  useEffect(() => {
    fetchCenters();
    fetchItems();
    fetchResponsiblePersons();
  }, []);

  const fetchCenters = async () => {
    const response = await fetch("/api/centers");
    const data = await response.json();
    const centersArray = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];
    setCenters(centersArray);
  };

  const fetchItems = async () => {
    const response = await fetch("/api/expense-items?page=1&limit=1000");
    const data = await response.json();
    const itemsArray = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];
    setItems(itemsArray);
  };

  const fetchResponsiblePersons = async () => {
    const response = await fetch("/api/responsible-persons?page=1&limit=1000");
    const data = await response.json();
    const personsArray = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];
    setResponsiblePersons(personsArray);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("module", "expenses");
      formData.append("path", "victoria-academy-finance/storage/finance");

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

      // Prepare data with proper null handling for optional fields
      const submitData = {
        ...formData,
        category: formData.category || null,
        itemId: formData.itemId || null,
        responsibleId: formData.responsibleId || null,
        status: formData.status || null,
        amount: formData.total || 0, // Set amount equal to total since amount field is not in UI
      };

      const body = record ? { id: record.id, ...submitData } : submitData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        alert("Có lỗi xảy ra: " + (errorData.error || "Unknown error"));
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

          <div>
            <label className="label">Khoản chi</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="input"
              placeholder="Nhập khoản chi..."
              required
            />
          </div>

          <div>
            <label className="label">Hạng mục</label>
            <select
              value={formData.itemId}
              onChange={(e) =>
                setFormData({ ...formData, itemId: e.target.value })
              }
              className="input"
              required
            >
              <option value="">Chọn hạng mục</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Phụ trách</label>
            <select
              value={formData.responsibleId}
              onChange={(e) =>
                setFormData({ ...formData, responsibleId: e.target.value })
              }
              className="input"
            >
              <option value="">Không chọn người phụ trách</option>
              {responsiblePersons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Tình trạng</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="input"
            >
              <option value="">Chọn tình trạng</option>
              <option value="Đã chi">Đã chi</option>
              <option value="Chưa chi">Chưa chi</option>
            </select>
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
                <div className="mt-2">
                  <p className="text-sm text-success-600 mb-1">
                    ✓ File đã được tải lên
                  </p>
                  <a
                    href={formData.uploadedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 underline"
                  >
                    Xem file đã tải lên
                  </a>
                </div>
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
