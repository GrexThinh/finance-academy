"use client";

import { useState } from "react";
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ImportResult {
  incomeImported: number;
  expenseImported: number;
  errors: string[];
}

export default function ExcelImportModal({
  isOpen,
  onClose,
  onSuccess,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storeFile, setStoreFile] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Chỉ chấp nhận file Excel (.xlsx, .xls)");
        setFile(null);
        return;
      }

      // Validate file size (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("Kích thước file không được vượt quá 50MB");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("storeFile", storeFile.toString());
      formData.append("path", "victoria-academy-finance/storage/finance");

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.results);
        onSuccess?.();
      } else {
        setError(data.error || "Có lỗi xảy ra khi tải file");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Có lỗi xảy ra khi tải file");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setStoreFile(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Tải lên file Excel
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* File format info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Định dạng file Excel
                  </h4>
                  <p className="text-sm text-blue-700">
                    File phải có 2 sheet: "DATA" (thu nhập) và "CHI" (chi phí)
                    theo định dạng như file mẫu.
                  </p>
                </div>
              </div>
            </div>

            {/* File storage option */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={storeFile}
                  onChange={(e) => setStoreFile(e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Lưu file Excel vào AWS S3
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    File sẽ được lưu trong thư mục "imports" để tham khảo sau
                    này
                  </p>
                </div>
              </label>
            </div>

            {/* File upload area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Chọn file Excel để tải lên
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    XLSX, XLS tối đa 50MB
                  </p>
                </div>
              </div>

              {/* Selected file display */}
              {file && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-900">{file.name}</span>
                    <button
                      onClick={() => setFile(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Result display */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 mb-2">
                      Tải lên thành công!
                    </p>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• Thu nhập: {result.incomeImported} bản ghi</p>
                      <p>• Chi phí: {result.expenseImported} bản ghi</p>
                      {result.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-red-700">
                            Lỗi ({result.errors.length}):
                          </p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {result.errors.slice(0, 5).map((error, index) => (
                              <li key={index} className="text-red-600 text-xs">
                                {error}
                              </li>
                            ))}
                            {result.errors.length > 5 && (
                              <li className="text-red-600 text-xs">
                                ... và {result.errors.length - 5} lỗi khác
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={uploading}
              >
                {result ? "Đóng" : "Hủy"}
              </button>
              {file && !result && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Tải lên
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
