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
    const programId = searchParams.get('programId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    if (centerId) where.centerId = centerId
    if (programId) where.programId = programId
    if (year) where.year = parseInt(year)
    if (month) where.month = parseInt(month)

    // Get total count for pagination
    const totalCount = await prisma.incomeRecord.count({ where })

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    const incomeRecords = await prisma.incomeRecord.findMany({
      where,
      include: {
        center: true,
        program: true,
        partner: true,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
      skip,
      take: limit,
    })

    return NextResponse.json({
      data: incomeRecords,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching income records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch income records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      month,
      year,
      centerId,
      programId,
      partnerId,
      numberOfClasses,
      numberOfStudents,
      revenue,
      status,
      notes,
      uploadedFileUrl,
    } = body

    const incomeRecord = await prisma.incomeRecord.create({
      data: {
        month,
        year,
        centerId,
        programId,
        partnerId: partnerId || null,
        numberOfClasses: numberOfClasses || 0,
        numberOfStudents: numberOfStudents || 0,
        revenue,
        status,
        notes,
        uploadedFileUrl,
      },
      include: {
        center: true,
        program: true,
        partner: true,
      },
    })

    return NextResponse.json(incomeRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating income record:', error)
    return NextResponse.json(
      { error: 'Failed to create income record' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...data } = body

    const incomeRecord = await prisma.incomeRecord.update({
      where: { id },
      data,
      include: {
        center: true,
        program: true,
        partner: true,
      },
    })

    return NextResponse.json(incomeRecord)
  } catch (error) {
    console.error('Error updating income record:', error)
    return NextResponse.json(
      { error: 'Failed to update income record' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.incomeRecord.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting income record:', error)
    return NextResponse.json(
      { error: 'Failed to delete income record' },
      { status: 500 }
    )
  }
}
