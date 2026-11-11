import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { verifyWebhookSignature } from '@/lib/lemon-squeezy'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const rawBodyBuffer = Buffer.from(await request.arrayBuffer())
    const signature = request.headers.get('x-signature') || ''

    if (process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(rawBodyBuffer, signature)
      if (!isValid) {
        return NextResponse.json({ error: 'Signature de webhook invalide' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBodyBuffer.toString('utf8'))
    const eventName = payload?.meta?.event_name

    if (eventName === 'order_created') {
      const attributes = payload?.data?.attributes
      const customData = payload?.meta?.custom_data
      const orderId = customData?.order_id

      if (orderId) {
        await prisma.$transaction(async (tx) => {
          const existingOrder = await tx.order.findUnique({
            where: { id: orderId },
            include: { business: { include: { seller: true } } },
          })

          if (!existingOrder || existingOrder.paymentStatus === 'PAID') return

          // Conditional state transition prevents duplicate webhook deliveries
          // from crediting the seller more than once.
          const claimed = await tx.order.updateMany({
            where: { id: orderId, paymentStatus: { not: 'PAID' } },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              lsOrderId: String(payload.data.id),
            },
          })
          if (claimed.count === 0) return

          // Use Decimal arithmetic end-to-end; JavaScript floating-point math is unsafe for money.
          const totalAmount = attributes?.total
            ? new Prisma.Decimal(attributes.total).div(100)
            : existingOrder.total
          const platformCommission = totalAmount
            .mul(existingOrder.business.seller.commissionRate)
            .div(100)
          const netSellerCredit = totalAmount.minus(platformCommission)

          const updatedSeller = await tx.seller.update({
            where: { id: existingOrder.business.sellerId },
            data: {
              balance: { increment: netSellerCredit },
              totalSales: { increment: 1 },
            },
          })

          await tx.ledgerEntry.create({
            data: {
              sellerId: existingOrder.business.sellerId,
              orderId: existingOrder.id,
              type: 'SALE_CREDIT',
              amount: netSellerCredit,
              balance: updatedSeller.balance,
              description: `Vente commande #${existingOrder.id.slice(0, 8)} (Commission ${existingOrder.business.seller.commissionRate}%)`,
            },
          })
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
      }

    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('Lemon Squeezy Webhook Error:', error)
    return NextResponse.json({ error: 'Erreur traitement webhook' }, { status: 500 })
  }
}
