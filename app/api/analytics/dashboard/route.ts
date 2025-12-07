import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total revenue
    const totalRevenue = await prisma.incomeRecord.aggregate({
      _sum: {
        revenue: true,
      },
    });

    // Get total expenses
    const totalExpenses = await prisma.expenseRecord.aggregate({
      _sum: {
        total: true,
      },
    });

    const revenue = Number(totalRevenue._sum.revenue || 0);
    const expenses = Number(totalExpenses._sum.total || 0);
    const profit = revenue - expenses;

    // Get center count
    const centerCount = await prisma.center.count();

    // Get monthly trends (last 12 months)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;

      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      const monthRevenue = await prisma.incomeRecord.aggregate({
        where: { year, month },
        _sum: { revenue: true },
      });

      const monthExpenses = await prisma.expenseRecord.aggregate({
        where: { year, month },
        _sum: { total: true },
      });

      monthlyData.push({
        month,
        year,
        revenue: Number(monthRevenue._sum.revenue || 0),
        expenses: Number(monthExpenses._sum.total || 0),
      });
    }

    // Get top performing centers
    const centerPerformance = await prisma.incomeRecord.groupBy({
      by: ["centerId"],
      _sum: {
        revenue: true,
      },
      orderBy: {
        _sum: {
          revenue: "desc",
        },
      },
      take: 5,
    });

    const centerIds = centerPerformance.map((cp) => cp.centerId as string);
    const centers = await prisma.center.findMany({
      where: { id: { in: centerIds } },
    });

    const centerMap = new Map(centers.map((c) => [c.id, c.name]));
    const topCenters = centerPerformance.map((cp) => ({
      centerId: cp.centerId as string,
      centerName: centerMap.get(cp.centerId as string) || "Unknown",
      revenue: Number(cp._sum.revenue || 0),
    }));

    // Get expense categories breakdown
    const expenseCategoriesData = await prisma.expenseRecord.groupBy({
      by: ["category"],
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 6,
    });

    const expenseCategories = expenseCategoriesData.map((ec) => ({
      categoryName: ec.category || "Unknown",
      amount: Number(ec._sum.total || 0),
    }));

    // Get profit margins by center
    const allCenters = await prisma.center.findMany();
    const profitMargins = [];

    for (const center of allCenters) {
      const centerRevenue = await prisma.incomeRecord.aggregate({
        where: { centerId: center.id },
        _sum: { revenue: true },
      });

      const centerExpenses = await prisma.expenseRecord.aggregate({
        where: { centerId: center.id },
        _sum: { total: true },
      });

      const revenue = Number(centerRevenue._sum.revenue || 0);
      const expenses = Number(centerExpenses._sum.total || 0);
      const profitMargin =
        revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;

      if (revenue > 0) {
        profitMargins.push({
          centerName: center.name,
          profitMargin: Number(profitMargin.toFixed(2)),
        });
      }
    }

    profitMargins.sort((a, b) => b.profitMargin - a.profitMargin);

    // Get yearly comparison (last 3 years)
    const yearlyData = [];
    for (let year = currentYear - 2; year <= currentYear; year++) {
      const yearRevenue = await prisma.incomeRecord.aggregate({
        where: { year },
        _sum: { revenue: true },
      });

      const yearExpenses = await prisma.expenseRecord.aggregate({
        where: { year },
        _sum: { total: true },
      });

      const revenue = Number(yearRevenue._sum.revenue || 0);
      const expenses = Number(yearExpenses._sum.total || 0);

      yearlyData.push({
        year,
        revenue,
        expenses,
        profit: revenue - expenses,
      });
    }

    return NextResponse.json({
      summary: {
        totalRevenue: revenue,
        totalExpenses: expenses,
        totalProfit: profit,
        centerCount,
      },
      monthlyTrends: monthlyData,
      topCenters,
      expenseCategories,
      profitMargins: profitMargins.slice(0, 5), // Top 5 centers by profit margin
      yearlyComparison: yearlyData,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
