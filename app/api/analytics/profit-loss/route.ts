import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const centerId = searchParams.get('centerId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    const where: any = {}
    if (centerId) where.centerId = centerId
    if (year) {
      where.year = parseInt(year)
      if (month) where.month = parseInt(month)
    }

    // Get income aggregation
    const incomeAgg = await prisma.incomeRecord.groupBy({
      by: ['centerId', 'year', 'month'],
      where,
      _sum: {
        revenue: true,
      },
    })

    // Get expense aggregation
    const expenseAgg = await prisma.expenseRecord.groupBy({
      by: ['centerId', 'year', 'month'],
      where,
      _sum: {
        total: true,
      },
    })

    // Get center details
    const centers = await prisma.center.findMany()
    const centerMap = new Map(centers.map((c: any) => [c.id, c]))

    // Combine data
    const profitLossMap = new Map<string, any>()

    incomeAgg.forEach((item: any) => {
      const key = `${item.centerId}-${item.year}-${item.month}`
      profitLossMap.set(key, {
        centerId: item.centerId,
        centerName: centerMap.get(item.centerId)?.name || 'Unknown',
        year: item.year,
        month: item.month,
        income: Number(item._sum.revenue || 0),
        expense: 0,
        profit: 0,
      })
    })

    expenseAgg.forEach((item: any) => {
      const key = `${item.centerId}-${item.year}-${item.month}`
      const existing = profitLossMap.get(key)
      if (existing) {
        existing.expense = Number(item._sum.total || 0)
      } else {
        profitLossMap.set(key, {
          centerId: item.centerId,
          centerName: centerMap.get(item.centerId)?.name || 'Unknown',
          year: item.year,
          month: item.month,
          income: 0,
          expense: Number(item._sum.total || 0),
          profit: 0,
        })
      }
    })

    // Calculate profit
    const profitLossData = Array.from(profitLossMap.values()).map(item => ({
      ...item,
      profit: item.income - item.expense,
    }))

    // Sort by year, month desc
    profitLossData.sort((a: any, b: any) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })

    return NextResponse.json(profitLossData)
  } catch (error) {
    console.error('Error calculating profit/loss:', error)
    return NextResponse.json(
      { error: 'Failed to calculate profit/loss' },
      { status: 500 }
    )
  }
}
