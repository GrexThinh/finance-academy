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
    const totalCount = await prisma.partner.count()

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    const partners = await prisma.partner.findMany({
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    })

    return NextResponse.json({
      data: partners,
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
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
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

    // Check if partner already exists
    const existingPartner = await prisma.partner.findUnique({
      where: { name },
    })

    if (existingPartner) {
      return NextResponse.json(
        { error: 'Partner with this name already exists' },
        { status: 400 }
      )
    }

    const partner = await prisma.partner.create({
      data: { name, code },
    })

    return NextResponse.json(partner, { status: 201 })
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    )
  }
}
