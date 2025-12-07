import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { createExcelBuffer, createCSVBuffer } from '@/lib/export'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'income', 'expense', 'combined', 'dashboard', 'summary'
    const format = searchParams.get('format') // 'xlsx', 'csv'
    const centerId = searchParams.get('centerId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    const where: any = {}
    if (centerId) where.centerId = centerId
    if (year) {
      where.year = parseInt(year)
      if (month) where.month = parseInt(month)
    }

    const exportData: any[] = []

    // Dashboard summary export
    if (type === 'dashboard' || type === 'summary') {
      // Get summary data
      const totalRevenue = await prisma.incomeRecord.aggregate({
        where,
        _sum: { revenue: true },
      })

      const totalExpenses = await prisma.expenseRecord.aggregate({
        where,
        _sum: { total: true },
      })

      const revenue = Number(totalRevenue._sum.revenue || 0)
      const expenses = Number(totalExpenses._sum.total || 0)
      const profit = revenue - expenses

      // Monthly breakdown
      const monthlyData = []
      for (let m = 1; m <= 12; m++) {
        const monthRevenue = await prisma.incomeRecord.aggregate({
          where: { ...where, month: m },
          _sum: { revenue: true },
        })

        const monthExpenses = await prisma.expenseRecord.aggregate({
          where: { ...where, month: m },
          _sum: { total: true },
        })

        monthlyData.push([
          m,
          year || new Date().getFullYear(),
          Number(monthRevenue._sum.revenue || 0),
          Number(monthExpenses._sum.total || 0),
          Number(monthRevenue._sum.revenue || 0) - Number(monthExpenses._sum.total || 0),
        ])
      }

      // Summary sheet
      exportData.push({
        headers: ['Chỉ số', 'Giá trị'],
        rows: [
          ['Tổng doanh thu', revenue],
          ['Tổng chi phí', expenses],
          ['Lợi nhuận', profit],
          ['Tỷ suất lợi nhuận', revenue > 0 ? `${((profit / revenue) * 100).toFixed(2)}%` : '0%'],
        ],
        sheetName: 'Tổng quan',
      })

      // Monthly breakdown sheet
      exportData.push({
        headers: ['Tháng', 'Năm', 'Doanh thu', 'Chi phí', 'Lợi nhuận'],
        rows: monthlyData,
        sheetName: 'Theo tháng',
      })

      // Center performance
      const centerPerformance = await prisma.incomeRecord.groupBy({
        by: ['centerId'],
        where,
        _sum: { revenue: true },
      })

      const centerIds = centerPerformance.map((cp: any) => cp.centerId)
      const centers = await prisma.center.findMany({
        where: { id: { in: centerIds } },
      })

      const centerMap = new Map(centers.map((c: any) => [c.id, c.name]))

      const centerRows = []
      for (const cp of centerPerformance as any[]) {
        const centerRevenue = Number(cp._sum.revenue || 0)
        const centerExpenses = await prisma.expenseRecord.aggregate({
          where: { centerId: cp.centerId, ...where },
          _sum: { total: true },
        })
        const centerExpense = Number(centerExpenses._sum.total || 0)
        const centerProfit = centerRevenue - centerExpense

        centerRows.push([
          centerMap.get(cp.centerId) || 'Unknown',
          centerRevenue,
          centerExpense,
          centerProfit,
          centerRevenue > 0 ? `${((centerProfit / centerRevenue) * 100).toFixed(2)}%` : '0%',
        ])
      }

      exportData.push({
        headers: ['Trung tâm', 'Doanh thu', 'Chi phí', 'Lợi nhuận', 'Tỷ suất lợi nhuận'],
        rows: centerRows,
        sheetName: 'Theo trung tâm',
      })
    }

    if (type === 'income' || type === 'combined') {
      const incomeRecords = await prisma.incomeRecord.findMany({
        where,
        include: {
          center: true,
          program: true,
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      })

      const incomeRows = incomeRecords.map((record: any) => [
        record.month,
        record.year,
        record.center.name,
        record.program.name,
        record.numberOfClasses,
        record.numberOfStudents,
        Number(record.revenue),
        record.status || '',
        record.notes || '',
      ])

      exportData.push({
        headers: [
          'Tháng',
          'Năm',
          'Trung Tâm',
          'Chương Trình',
          'Số Lớp',
          'Số Học Viên',
          'Doanh Thu',
          'Tình Trạng',
          'Ghi Chú',
        ],
        rows: incomeRows,
        sheetName: 'Thu',
      })
    }

    if (type === 'expense' || type === 'combined') {
      const expenseRecords = await prisma.expenseRecord.findMany({
        where,
        include: {
          center: true,
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      })

      const expenseRows = expenseRecords.map((record: any) => [
        record.month,
        record.year,
        record.center.name,
        record.category,
        record.item,
        record.position || '',
        record.contractType || '',
        Number(record.hours || 0),
        Number(record.unitPrice || 0),
        Number(record.amount),
        Number(record.kilometers || 0),
        Number(record.travelAllowance || 0),
        record.responsible || '',
        record.status || '',
        Number(record.total),
        record.notes || '',
      ])

      exportData.push({
        headers: [
          'Tháng',
          'Năm',
          'Trung Tâm',
          'Khoản Chi',
          'Hạng Mục',
          'Chức Vụ',
          'Loại HD',
          'Số Giờ',
          'Đơn Giá',
          'Thành Tiền',
          'Số KM',
          'PC Di Chuyển',
          'Phụ Trách',
          'Tình Trạng',
          'Tổng',
          'Ghi Chú',
        ],
        rows: expenseRows,
        sheetName: 'Chi',
      })
    }

    let buffer: Buffer
    let contentType: string
    let fileName: string

    if (format === 'csv') {
      // For CSV, export only the first sheet
      const firstSheet = exportData[0]
      buffer = createCSVBuffer(firstSheet)
      contentType = 'text/csv'
      fileName = `bao-cao-tai-chinh-${Date.now()}.csv`
    } else {
      // Default to Excel format
      buffer = createExcelBuffer(exportData)
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      fileName = `bao-cao-tai-chinh-${Date.now()}.xlsx`
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
