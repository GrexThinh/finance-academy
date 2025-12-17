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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get total count for pagination
    const totalCount = await prisma.center.count()

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    const centers = await prisma.center.findMany({
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    })

    return NextResponse.json({
      data: centers,
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
    console.error('Error fetching centers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch centers' },
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
    const { name, code } = body

    const center = await prisma.center.create({
      data: { name, code },
    })

    return NextResponse.json(center, { status: 201 })
  } catch (error) {
    console.error('Error creating center:', error)
    return NextResponse.json(
      { error: 'Failed to create center' },
      { status: 500 }
    )
  }
}
