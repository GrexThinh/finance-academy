'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Download, Search, Filter, ChevronUp, ChevronDown } from 'lucide-react'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { useDragScroll } from '@/lib/use-drag-scroll'
import ExpenseModal from '@/components/modals/expense-modal'

interface ExpenseRecord {
  id: string
  month: number
  year: number
  center: { id: string; name: string }
  category: string
  item: string
  position?: string
  contractType?: string
  hours?: string
  unitPrice?: string
  amount: string
  kilometers?: string
  travelAllowance?: string
  responsible?: string
  status?: string
  total: string
  notes?: string
}

type SortField = 'date' | 'center' | 'category' | 'item' | 'amount' | 'total'
type SortDirection = 'asc' | 'desc'

export default function ExpensesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [records, setRecords] = useState<ExpenseRecord[]>([])
  const [centers, setCenters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedCenter, setSelectedCenter] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const { ref: tableRef, isDragging, handlers } = useDragScroll({ dragSpeed: 2 })

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    fetchRecords()
    fetchCenters()
  }, [status, session, router])

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setRecords(Array.isArray(data) ? data : [])
      } else {
        console.error('API error:', response.status, response.statusText)
        setRecords([])
      }
    } catch (error) {
      console.error('Error fetching expense records:', error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCenters = async () => {
    try {
      const response = await fetch('/api/centers')
      if (response.ok) {
        const data = await response.json()
        setCenters(Array.isArray(data) ? data : [])
      } else {
        console.error('API error:', response.status, response.statusText)
        setCenters([])
      }
    } catch (error) {
      console.error('Error fetching centers:', error)
      setCenters([])
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ type: 'expense' })
      if (selectedYear) params.append('year', selectedYear)
      
      const response = await fetch(`/api/export?${params}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chi-phi-${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) return

    try {
      await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' })
      fetchRecords()
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const filteredRecords = records
    .filter((record) => {
      const matchesSearch =
        record.center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.item || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.responsible && record.responsible.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.position && record.position.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesYear = !selectedYear || record.year.toString() === selectedYear
      const matchesMonth = !selectedMonth || record.month.toString() === selectedMonth
      const matchesCenter = !selectedCenter || record.center.id === selectedCenter
      const matchesStatus = !selectedStatus || record.status === selectedStatus

      return matchesSearch && matchesYear && matchesMonth && matchesCenter && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'date':
          aValue = new Date(a.year, a.month - 1)
          bValue = new Date(b.year, b.month - 1)
          break
        case 'center':
          aValue = a.center.name
          bValue = b.center.name
          break
        case 'category':
          aValue = a.category || ''
          bValue = b.category || ''
          break
        case 'item':
          aValue = a.item || ''
          bValue = b.item || ''
          break
        case 'amount':
          aValue = parseFloat(a.amount)
          bValue = parseFloat(b.amount)
          break
        case 'total':
          aValue = parseFloat(a.total)
          bValue = parseFloat(b.total)
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Calculate totals
  const totals = filteredRecords.reduce(
    (acc, record) => ({
      amount: acc.amount + parseFloat(record.amount),
      total: acc.total + parseFloat(record.total),
      count: acc.count + 1,
    }),
    { amount: 0, total: 0, count: 0 }
  )

  const years = Array.from(new Set(records.map((r) => r.year))).sort((a, b) => b - a)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const statuses = Array.from(new Set(records.map((r) => r.status).filter(Boolean))).sort()

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
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <button
            onClick={() => {
              setEditingRecord(null)
              setModalOpen(true)
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
              <p className="text-sm font-medium text-gray-600">Tổng số bản ghi</p>
              <p className="text-2xl font-bold text-gray-900">{totals.count}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số tiền</p>
              <p className="text-2xl font-bold text-success-600">{formatCurrency(totals.amount.toString())}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold text-danger-600">{formatCurrency(totals.total.toString())}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trung bình/bản ghi</p>
              <p className="text-2xl font-bold text-primary-600">
                {totals.count > 0 ? formatCurrency((totals.total / totals.count).toString()) : formatCurrency('0')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div>
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
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input"
            >
              <option value="">Tất cả tháng</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </div>
          <div>
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
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div
          ref={tableRef}
          className={`overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
          {...handlers}
        >
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Thời gian
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('center')}
                >
                  <div className="flex items-center gap-1">
                    Trung tâm
                    {sortField === 'center' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Khoản chi
                    {sortField === 'category' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('item')}
                >
                  <div className="flex items-center gap-1">
                    Hạng mục
                    {sortField === 'item' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    Số tiền
                    {sortField === 'amount' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center gap-1">
                    Tổng
                    {sortField === 'total' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-2 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-2 text-center text-gray-500">
                    Không có dữ liệu phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                <>
                  {filteredRecords.map((record) => (
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
                              setEditingRecord(record)
                              setModalOpen(true)
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
                  ))}
                  {/* Totals Row */}
                  {filteredRecords.length > 0 && (
                    <tr className="bg-gray-50 border-t-2 border-gray-300">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900" colSpan={4}>
                        TỔNG ({filteredRecords.length} bản ghi)
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-success-600">
                        {formatCurrency(totals.amount.toString())}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-danger-600">
                        {formatCurrency(totals.total.toString())}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        -
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <ExpenseModal
          record={editingRecord}
          onClose={() => {
            setModalOpen(false)
            setEditingRecord(null)
          }}
          onSuccess={() => {
            setModalOpen(false)
            setEditingRecord(null)
            fetchRecords()
          }}
        />
      )}
    </div>
  )
}
