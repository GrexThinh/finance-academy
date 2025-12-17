'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Building2, Search, Filter } from 'lucide-react'
import { useDragScroll } from '@/lib/use-drag-scroll'

interface Center {
  id: string
  name: string
  code: string | null
  createdAt: string
  updatedAt: string
}

interface CenterFormData {
  name: string
  code: string
}

export default function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState<Center | null>(null)
  const [formData, setFormData] = useState<CenterFormData>({
    name: '',
    code: '',
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { ref: tableRef, isDragging, handlers } = useDragScroll({ dragSpeed: 2 })

  useEffect(() => {
    fetchCenters()
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Reset to page 1 when search term changes
  }, [searchTerm])

  const fetchCenters = async () => {
    try {
      setLoading(true)
      // Load all centers for client-side filtering and pagination
      const response = await fetch('/api/centers?page=1&limit=1000') // Large limit to get all
      const result = await response.json()
      setCenters(result.data || [])
      setTotalCount(result.pagination?.totalCount || (result.data?.length || 0))
    } catch (error) {
      console.error('Error fetching centers:', error)
      setCenters([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCenter ? `/api/centers/${editingCenter.id}` : '/api/centers'
      const method = editingCenter ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingCenter(null)
        setFormData({ name: '', code: '' })
        fetchCenters()
        setCurrentPage(1) // Reset to page 1 after create/update
      } else {
        const error = await response.json()
        alert(error.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error saving center:', error)
      alert('Có lỗi xảy ra khi lưu trung tâm')
    }
  }

  const handleEdit = (center: Center) => {
    setEditingCenter(center)
    setFormData({
      name: center.name,
      code: center.code || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (centerId: string, centerName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa trung tâm "${centerName}"?`)) return

    try {
      const response = await fetch(`/api/centers/${centerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCenters()
        setCurrentPage(1) // Reset to page 1 after delete
      } else {
        const error = await response.json()
        alert(error.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error deleting center:', error)
      alert('Có lỗi xảy ra khi xóa trung tâm')
    }
  }

  const filteredCenters = centers.filter((center) => {
    const matchesSearch =
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (center.code && center.code.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  // Calculate pagination for filtered results
  const paginatedCenters = filteredCenters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const maxPages = Math.ceil(filteredCenters.length / itemsPerPage)

  const openCreateModal = () => {
    setEditingCenter(null)
    setFormData({ name: '', code: '' })
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý trung tâm</h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách các trung tâm đào tạo
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm trung tâm
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Tìm kiếm</h3>
        </div>
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã trung tâm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Centers Table */}
      <div className="card overflow-hidden p-0">
        <div
          ref={tableRef}
          className={`overflow-x-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
          {...handlers}
        >
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tên trung tâm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã trung tâm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : paginatedCenters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    {filteredCenters.length === 0 ? 'Chưa có trung tâm nào' : 'Không có kết quả phù hợp'}
                  </td>
                </tr>
              ) : (
                paginatedCenters.map((center) => (
                  <tr key={center.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {center.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {center.code || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(center.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(center)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(center.id, center.name)}
                          className="text-danger-600 hover:text-danger-900"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
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
        {maxPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredCenters.length)} của {filteredCenters.length} kết quả
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, maxPages) }, (_, i) => {
                let pageNum;
                if (maxPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= maxPages - 2) {
                  pageNum = maxPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
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
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === maxPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Center Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCenter ? 'Chỉnh sửa trung tâm' : 'Thêm trung tâm mới'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Tên trung tâm</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Mã trung tâm (tùy chọn)</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCenter ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

