'use client'

import { useEffect, useState } from 'react'
import { X, Upload } from 'lucide-react'

interface IncomeModalProps {
  record: any | null
  onClose: () => void
  onSuccess: () => void
}

export default function IncomeModal({ record, onClose, onSuccess }: IncomeModalProps) {
  const [centers, setCenters] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    month: record?.month || new Date().getMonth() + 1,
    year: record?.year || new Date().getFullYear(),
    centerId: record?.center?.id || '',
    programId: record?.program?.id || '',
    partnerId: record?.partner?.id || '',
    numberOfClasses: record?.numberOfClasses || 0,
    numberOfStudents: record?.numberOfStudents || 0,
    revenue: record?.revenue || '',
    status: record?.status || '',
    notes: record?.notes || '',
    uploadedFileUrl: record?.uploadedFileUrl || '',
  })

  useEffect(() => {
    fetchCenters()
    fetchPrograms()
    fetchPartners()
  }, [])

  const fetchCenters = async () => {
    const response = await fetch('/api/centers')
    const data = await response.json()
    setCenters(data)
  }

  const fetchPrograms = async () => {
    const response = await fetch('/api/programs')
    const data = await response.json()
    setPrograms(data)
  }

  const fetchPartners = async () => {
    const response = await fetch('/api/partners')
    const data = await response.json()
    setPartners(data)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setFormData((prev) => ({ ...prev, uploadedFileUrl: data.url }))
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Lỗi khi tải file lên')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = '/api/income'
      const method = record ? 'PUT' : 'POST'
      const body = record ? { id: record.id, ...formData } : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSuccess()
      } else {
        alert('Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error saving record:', error)
      alert('Có lỗi xảy ra')
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {record ? 'Sửa thu nhập' : 'Thêm thu nhập mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              onChange={(e) => setFormData({ ...formData, centerId: e.target.value })}
              className="input"
              required
            >
              <option value="">Chọn trung tâm</option>
              {centers.map((center) => (
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
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
              className="input"
            >
              <option value="">Không có đối tác</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
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
              onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input"
              placeholder="Ví dụ: Đã thu, Chưa thu"
            />
          </div>

          <div>
            <label className="label">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                {uploading ? 'Đang tải...' : 'Chọn file'}
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
              {record ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
