import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const centers = await prisma.center.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(centers)
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
