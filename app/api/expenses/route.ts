import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expenseRecords = await prisma.expenseRecord.findMany({
      include: {
        center: true,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    })

    return NextResponse.json(expenseRecords)
  } catch (error) {
    console.error('Error fetching expense records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expense records' },
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
      category,
      item,
      position,
      contractType,
      hours,
      unitPrice,
      amount,
      kilometers,
      travelAllowance,
      responsible,
      status,
      total,
      notes,
      uploadedFileUrl,
    } = body

    const expenseRecord = await prisma.expenseRecord.create({
      data: {
        month,
        year,
        centerId,
        category,
        item,
        position,
        contractType,
        hours,
        unitPrice,
        amount,
        kilometers,
        travelAllowance,
        responsible,
        status,
        total,
        notes,
        uploadedFileUrl,
      },
      include: {
        center: true,
      },
    })

    return NextResponse.json(expenseRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating expense record:', error)
    return NextResponse.json(
      { error: 'Failed to create expense record' },
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

    const expenseRecord = await prisma.expenseRecord.update({
      where: { id },
      data,
      include: {
        center: true,
      },
    })

    return NextResponse.json(expenseRecord)
  } catch (error) {
    console.error('Error updating expense record:', error)
    return NextResponse.json(
      { error: 'Failed to update expense record' },
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

    await prisma.expenseRecord.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense record:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense record' },
      { status: 500 }
    )
  }
}
