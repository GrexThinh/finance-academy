"use client";

import { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";

interface IncomeModalProps {
  record: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function IncomeModal({
  record,
  onClose,
  onSuccess,
}: IncomeModalProps) {
  const [centers, setCenters] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    month: record?.month || new Date().getMonth() + 1,
    year: record?.year || new Date().getFullYear(),
    centerId: record?.center?.id || "",
    programId: record?.program?.id || "",
    partnerId: record?.partner?.id || "",
    numberOfClasses: record?.numberOfClasses || 0,
    numberOfStudents: record?.numberOfStudents || 0,
    revenue: record?.revenue || "",
    status: record?.status || "",
    notes: record?.notes || "",
    uploadedFileUrl: record?.uploadedFileUrl || "",
    // New spreadsheet fields
    tuitionFeeFullYear: record?.tuitionFeeFullYear || "",
    tuitionFeeHalfYear: record?.tuitionFeeHalfYear || "",
    tuitionFeeDiscount: record?.tuitionFeeDiscount || "",
    tuitionFeeOld: record?.tuitionFeeOld || "",
    sessionCount: record?.sessionCount || "",
    sessionCountNew: record?.sessionCountNew || "",
    numClassesHalfFee: record?.numClassesHalfFee || "",
    numClassesFullFee: record?.numClassesFullFee || "",
    numStudentsHalfFee: record?.numStudentsHalfFee || "",
    numStudentsFullFee: record?.numStudentsFullFee || "",
    numDiscountedStudents: record?.numDiscountedStudents || "",
    discount: record?.discount || "",
    payType: record?.payType || "",
    oldStudent: record?.oldStudent || "",
    freeStudentCount: record?.freeStudentCount || "",
    totalTuitionFee: record?.totalTuitionFee || "",
    facilitiesFee: record?.facilitiesFee || "",
    adminDeduction: record?.adminDeduction || "",
    agentCommission: record?.agentCommission || "",
    teacherDeduction: record?.teacherDeduction || "",
    totalDeduction: record?.totalDeduction || "",
    actualReceivable: record?.actualReceivable || "",
    submittedToCenter: record?.submittedToCenter || "",
    collectionDate: record?.collectionDate
      ? new Date(record.collectionDate).toISOString().split("T")[0]
      : "",
    difference: record?.difference || "",
    selfEnrollCount: record?.selfEnrollCount || "",
    retentionRate: record?.retentionRate || "",
    staffInvolved: record?.staffInvolved || "",
    hrRetention: record?.hrRetention || "",
    hrContract: record?.hrContract || "",
    schoolDeductionMethod: record?.schoolDeductionMethod || "",
    centerDeductionMethod: record?.centerDeductionMethod || "",
    contractStatus: record?.contractStatus || "",
    teacherRate: record?.teacherRate || "",
  });

  useEffect(() => {
    fetchCenters();
    fetchPrograms();
    fetchPartners();
  }, []);

  const fetchCenters = async () => {
    const response = await fetch("/api/centers");
    const data = await response.json();
    setCenters(data);
  };

  const fetchPrograms = async () => {
    const response = await fetch("/api/programs");
    const data = await response.json();
    setPrograms(data);
  };

  const fetchPartners = async () => {
    const response = await fetch("/api/partners");
    const data = await response.json();
    setPartners(data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("module", "income");

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
      const url = "/api/income";
      const method = record ? "PUT" : "POST";

      // Prepare data for submission
      const submitData = {
        ...formData,
        // Convert empty strings to null for optional fields
        partnerId: formData.partnerId || null,
        tuitionFeeFullYear: formData.tuitionFeeFullYear
          ? parseFloat(formData.tuitionFeeFullYear)
          : null,
        tuitionFeeHalfYear: formData.tuitionFeeHalfYear
          ? parseFloat(formData.tuitionFeeHalfYear)
          : null,
        tuitionFeeDiscount: formData.tuitionFeeDiscount
          ? parseFloat(formData.tuitionFeeDiscount)
          : null,
        tuitionFeeOld: formData.tuitionFeeOld
          ? parseFloat(formData.tuitionFeeOld)
          : null,
        sessionCount: formData.sessionCount
          ? parseInt(formData.sessionCount)
          : null,
        sessionCountNew: formData.sessionCountNew
          ? parseInt(formData.sessionCountNew)
          : null,
        numClassesHalfFee: formData.numClassesHalfFee
          ? parseInt(formData.numClassesHalfFee)
          : null,
        numClassesFullFee: formData.numClassesFullFee
          ? parseInt(formData.numClassesFullFee)
          : null,
        numStudentsHalfFee: formData.numStudentsHalfFee
          ? parseInt(formData.numStudentsHalfFee)
          : null,
        numStudentsFullFee: formData.numStudentsFullFee
          ? parseInt(formData.numStudentsFullFee)
          : null,
        numDiscountedStudents: formData.numDiscountedStudents
          ? parseInt(formData.numDiscountedStudents)
          : null,
        discount: formData.discount ? parseFloat(formData.discount) : null,
        freeStudentCount: formData.freeStudentCount
          ? parseInt(formData.freeStudentCount)
          : null,
        totalTuitionFee: formData.totalTuitionFee
          ? parseFloat(formData.totalTuitionFee)
          : null,
        facilitiesFee: formData.facilitiesFee
          ? parseFloat(formData.facilitiesFee)
          : null,
        adminDeduction: formData.adminDeduction
          ? parseFloat(formData.adminDeduction)
          : null,
        agentCommission: formData.agentCommission
          ? parseFloat(formData.agentCommission)
          : null,
        teacherDeduction: formData.teacherDeduction
          ? parseFloat(formData.teacherDeduction)
          : null,
        totalDeduction: formData.totalDeduction
          ? parseFloat(formData.totalDeduction)
          : null,
        actualReceivable: formData.actualReceivable
          ? parseFloat(formData.actualReceivable)
          : null,
        submittedToCenter: formData.submittedToCenter
          ? parseFloat(formData.submittedToCenter)
          : null,
        collectionDate: formData.collectionDate
          ? new Date(formData.collectionDate)
          : null,
        difference: formData.difference
          ? parseFloat(formData.difference)
          : null,
        selfEnrollCount: formData.selfEnrollCount
          ? parseInt(formData.selfEnrollCount)
          : null,
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
        console.error("Server error:", errorData);
        alert("Có lỗi xảy ra: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving record:", error);
      alert(
        "Có lỗi xảy ra: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {record ? "Sửa thu nhập" : "Thêm thu nhập mới"}
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
                centers?.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="label">Chương trình</label>
            <select
              value={formData.programId}
              onChange={(e) =>
                setFormData({ ...formData, programId: e.target.value })
              }
              className="input"
              required
            >
              <option value="">Chọn chương trình</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Đối tác (tùy chọn)</label>
            <select
              value={formData.partnerId}
              onChange={(e) =>
                setFormData({ ...formData, partnerId: e.target.value })
              }
              className="input"
            >
              <option value="">Không có đối tác</option>
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
              {partners && partners?.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
=======
              {partners &&
                partners?.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
>>>>>>> 1715de4 (update)
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Số lớp</label>
              <input
                type="number"
                value={formData.numberOfClasses}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfClasses: parseInt(e.target.value) || 0,
                  })
                }
                className="input"
                min="0"
              />
            </div>

            <div>
              <label className="label">Số học viên</label>
              <input
                type="number"
                value={formData.numberOfStudents}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfStudents: parseInt(e.target.value) || 0,
                  })
                }
                className="input"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="label">Doanh thu (VNĐ)</label>
            <input
              type="number"
              value={formData.revenue}
              onChange={(e) =>
                setFormData({ ...formData, revenue: e.target.value })
              }
              className="input"
              required
              min="0"
              step="1000"
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
              placeholder="Ví dụ: Đã thu, Chưa thu"
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
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
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

          {/* Tuition Fee Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Học phí</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Học phí năm học đầy đủ</label>
                <input
                  type="number"
                  value={formData.tuitionFeeFullYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tuitionFeeFullYear: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Học phí nửa năm</label>
                <input
                  type="number"
                  value={formData.tuitionFeeHalfYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tuitionFeeHalfYear: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Giảm giá học phí</label>
                <input
                  type="number"
                  value={formData.tuitionFeeDiscount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tuitionFeeDiscount: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Học phí cũ</label>
                <input
                  type="number"
                  value={formData.tuitionFeeOld}
                  onChange={(e) =>
                    setFormData({ ...formData, tuitionFeeOld: e.target.value })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* Session and Class Counts */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Số buổi học và lớp học
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Tổng số buổi học</label>
                <input
                  type="number"
                  value={formData.sessionCount}
                  onChange={(e) =>
                    setFormData({ ...formData, sessionCount: e.target.value })
                  }
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Số buổi học mới</label>
                <input
                  type="number"
                  value={formData.sessionCountNew}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sessionCountNew: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Số lớp học phí nửa năm</label>
                <input
                  type="number"
                  value={formData.numClassesHalfFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numClassesHalfFee: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Số lớp học phí đầy đủ</label>
                <input
                  type="number"
                  value={formData.numClassesFullFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numClassesFullFee: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Student Counts */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Số lượng học viên
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Số học viên học phí nửa năm</label>
                <input
                  type="number"
                  value={formData.numStudentsHalfFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numStudentsHalfFee: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Số học viên học phí đầy đủ</label>
                <input
                  type="number"
                  value={formData.numStudentsFullFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numStudentsFullFee: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Số học viên được giảm giá</label>
                <input
                  type="number"
                  value={formData.numDiscountedStudents}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numDiscountedStudents: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Số học viên miễn phí</label>
                <input
                  type="number"
                  value={formData.freeStudentCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      freeStudentCount: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Số học viên tự đăng ký</label>
                <input
                  type="number"
                  value={formData.selfEnrollCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      selfEnrollCount: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Payment and Financial Details */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Chi tiết tài chính
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Giảm giá</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Tổng học phí</label>
                <input
                  type="number"
                  value={formData.totalTuitionFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalTuitionFee: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Phí cơ sở vật chất</label>
                <input
                  type="number"
                  value={formData.facilitiesFee}
                  onChange={(e) =>
                    setFormData({ ...formData, facilitiesFee: e.target.value })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Khấu trừ quản lý</label>
                <input
                  type="number"
                  value={formData.adminDeduction}
                  onChange={(e) =>
                    setFormData({ ...formData, adminDeduction: e.target.value })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Hoa hồng đại lý</label>
                <input
                  type="number"
                  value={formData.agentCommission}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agentCommission: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Khấu trừ giáo viên</label>
                <input
                  type="number"
                  value={formData.teacherDeduction}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teacherDeduction: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Tổng khấu trừ</label>
                <input
                  type="number"
                  value={formData.totalDeduction}
                  onChange={(e) =>
                    setFormData({ ...formData, totalDeduction: e.target.value })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Thực thu</label>
                <input
                  type="number"
                  value={formData.actualReceivable}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      actualReceivable: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Đã nộp cho trung tâm</label>
                <input
                  type="number"
                  value={formData.submittedToCenter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      submittedToCenter: e.target.value,
                    })
                  }
                  className="input"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="label">Chênh lệch</label>
                <input
                  type="number"
                  value={formData.difference}
                  onChange={(e) =>
                    setFormData({ ...formData, difference: e.target.value })
                  }
                  className="input"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* Collection Date */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Thông tin thu thập
            </h3>
            <div>
              <label className="label">Ngày thu tiền</label>
              <input
                type="date"
                value={formData.collectionDate}
                onChange={(e) =>
                  setFormData({ ...formData, collectionDate: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Thông tin bổ sung
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Hình thức thanh toán</label>
                <input
                  type="text"
                  value={formData.payType}
                  onChange={(e) =>
                    setFormData({ ...formData, payType: e.target.value })
                  }
                  className="input"
                  placeholder="Ví dụ: Tiền mặt, Chuyển khoản"
                />
              </div>
              <div>
                <label className="label">Học viên cũ</label>
                <input
                  type="text"
                  value={formData.oldStudent}
                  onChange={(e) =>
                    setFormData({ ...formData, oldStudent: e.target.value })
                  }
                  className="input"
                  placeholder="Thông tin học viên cũ"
                />
              </div>
              <div>
                <label className="label">Tỷ lệ giữ chân</label>
                <input
                  type="text"
                  value={formData.retentionRate}
                  onChange={(e) =>
                    setFormData({ ...formData, retentionRate: e.target.value })
                  }
                  className="input"
                  placeholder="Ví dụ: 85%"
                />
              </div>
              <div>
                <label className="label">Nhân viên tham gia</label>
                <input
                  type="text"
                  value={formData.staffInvolved}
                  onChange={(e) =>
                    setFormData({ ...formData, staffInvolved: e.target.value })
                  }
                  className="input"
                  placeholder="Tên nhân viên"
                />
              </div>
              <div>
                <label className="label">HR giữ chân</label>
                <input
                  type="text"
                  value={formData.hrRetention}
                  onChange={(e) =>
                    setFormData({ ...formData, hrRetention: e.target.value })
                  }
                  className="input"
                  placeholder="Thông tin HR"
                />
              </div>
              <div>
                <label className="label">Hợp đồng HR</label>
                <input
                  type="text"
                  value={formData.hrContract}
                  onChange={(e) =>
                    setFormData({ ...formData, hrContract: e.target.value })
                  }
                  className="input"
                  placeholder="Trạng thái hợp đồng"
                />
              </div>
              <div>
                <label className="label">Phương pháp khấu trừ trường</label>
                <input
                  type="text"
                  value={formData.schoolDeductionMethod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      schoolDeductionMethod: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="Phương pháp khấu trừ"
                />
              </div>
              <div>
                <label className="label">Phương pháp khấu trừ trung tâm</label>
                <input
                  type="text"
                  value={formData.centerDeductionMethod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      centerDeductionMethod: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="Phương pháp khấu trừ"
                />
              </div>
              <div>
                <label className="label">Trạng thái hợp đồng</label>
                <input
                  type="text"
                  value={formData.contractStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, contractStatus: e.target.value })
                  }
                  className="input"
                  placeholder="Ví dụ: Đang hoạt động, Hết hạn"
                />
              </div>
              <div>
                <label className="label">Mức lương giáo viên</label>
                <input
                  type="text"
                  value={formData.teacherRate}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherRate: e.target.value })
                  }
                  className="input"
                  placeholder="Mức lương hoặc tỷ lệ"
                />
              </div>
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
