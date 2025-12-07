'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Download } from 'lucide-react'
import { useDragScroll } from '@/lib/use-drag-scroll'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatCurrency, getMonthName } from '@/lib/utils'

interface ProfitLossData {
  centerId: string
  centerName: string
  year: number
  month: number
  income: number
  expense: number
  profit: number
}

export default function ProfitLossPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<ProfitLossData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedCenter, setSelectedCenter] = useState<string>('')
  const { ref: tableRef, isDragging, handlers } = useDragScroll({ dragSpeed: 2 })

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    fetchData()
  }, [status, session, router, selectedYear, selectedCenter])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedYear) params.append('year', selectedYear)
      if (selectedCenter) params.append('centerId', selectedCenter)

      const response = await fetch(`/api/analytics/profit-loss?${params}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching profit/loss data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ type: 'combined' })
      if (selectedYear) params.append('year', selectedYear)
      if (selectedCenter) params.append('centerId', selectedCenter)
      
      const response = await fetch(`/api/export?${params}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bao-cao-loi-nhuan-${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const years = Array.from(new Set(data.map((d) => d.year))).sort((a, b) => b - a)
  const centers = Array.from(
    new Map(data.map((d) => [d.centerId, d.centerName])).entries()
  )

  // Aggregate by center
  const centerAggregation = data.reduce((acc, item) => {
    const existing = acc.find((a) => a.centerId === item.centerId)
    if (existing) {
      existing.income += item.income
      existing.expense += item.expense
      existing.profit += item.profit
    } else {
      acc.push({
        centerId: item.centerId,
        centerName: item.centerName,
        income: item.income,
        expense: item.expense,
        profit: item.profit,
      })
    }
    return acc
  }, [] as any[])

  const chartData = centerAggregation.map((item) => ({
    name: item.centerName,
    'Doanh thu': item.income,
    'Chi phí': item.expense,
    'Lợi nhuận': item.profit,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân tích lợi nhuận/lỗ</h1>
          <p className="text-gray-600 mt-1">
            Xem báo cáo lợi nhuận và lỗ theo từng trung tâm
          </p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Năm</label>
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
            <label className="label">Trung tâm</label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="input"
            >
              <option value="">Tất cả trung tâm</option>
              {centers.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Biểu đồ lợi nhuận theo trung tâm
        </h3>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Không có dữ liệu</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="Doanh thu" fill="#22c55e" />
              <Bar dataKey="Chi phí" fill="#ef4444" />
              <Bar dataKey="Lợi nhuận" fill="#0ea5e9">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry['Lợi nhuận'] >= 0 ? '#0ea5e9' : '#f97316'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trung tâm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Chi phí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Lợi nhuận/Lỗ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tỷ lệ lợi nhuận
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const profitMargin =
                    item.income > 0 ? (item.profit / item.income) * 100 : 0
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getMonthName(item.month)} {item.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.centerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600">
                        {formatCurrency(item.income)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-danger-600">
                        {formatCurrency(item.expense)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                          item.profit >= 0 ? 'text-primary-600' : 'text-orange-600'
                        }`}
                      >
                        {formatCurrency(item.profit)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          profitMargin >= 0 ? 'text-primary-600' : 'text-orange-600'
                        }`}
                      >
                        {profitMargin.toFixed(2)}%
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
