import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { triageComplaint } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Connexion requise pour déposer un signalement' }, { status: 401 })
    }

    const {
      reportType,
      targetId,
      targetType,
      reason,
      description,
      evidenceUrls = [],
    } = await request.json()

    if (!reportType || !targetId || !reason || !description) {
      return NextResponse.json({ error: 'Tous les champs obligatoires doivent être renseignés' }, { status: 400 })
    }

    // AI Auto-triage
    const aiAnalysis = await triageComplaint(description)

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        reportType,
        targetId,
        targetType: targetType || reportType,
        reason,
        description,
        evidenceUrls,
        resolutionNote: `[Auto-Triage IA] Priorité estimée: ${aiAnalysis.priority} | Résumé: ${aiAnalysis.summary}`,
      },
    })

    return NextResponse.json({ success: true, report }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur signalement'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const allowedRoles = ['SUPERADMIN', 'ADMIN', 'CUSTOMER_SUPPORT']
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ success: true, reports })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur récupération rapports'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
