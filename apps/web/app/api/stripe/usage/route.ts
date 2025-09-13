import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status, headers: { 'cache-control': 'no-store' } })
}

export async function GET(req: NextRequest) {
  const sk = (process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY || '').trim()
  if (!/^sk_(test|live)_[A-Za-z0-9]+$/.test(sk)) return bad('stripe_unconfigured', 500)

  const url = new URL(req.url)
  const customerParam = (url.searchParams.get('customer') || '').trim()
  const customerEnv = (process.env.STRIPE_TEST_CUSTOMER_ID || '').trim()
  const customer = customerParam || customerEnv
  if (!/^cus_[A-Za-z0-9]+$/.test(customer)) return bad('missing_customer', 400)

  const stripe = new Stripe(sk, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion })

  try {
    const [upcoming, subs] = await Promise.all([
      stripe.invoices.retrieveUpcoming({ customer }).catch((e: any) => {
        if (e?.statusCode === 404) return null // no upcoming invoice
        throw e
      }),
      stripe.subscriptions.list({
        customer,
        status: 'all',
        limit: 1,
        expand: ['data.items.data.price.product'],
      }),
    ])

    const sub = subs.data?.[0] || null
    const item = sub?.items?.data?.[0] || null
    const price = item?.price || null
    const product: any = (price as any)?.product || null

    const plan = sub
      ? {
          status: sub.status,
          price_nickname: price?.nickname || null,
          unit_amount: price?.unit_amount || null,
          currency: price?.currency || null,
          interval: price?.recurring?.interval || null,
          product_name: (product && typeof product === 'object' && 'name' in product) ? (product as any).name : null,
        }
      : null

    const upcomingSummary = upcoming
      ? {
          amount_due: upcoming.amount_due,
          currency: upcoming.currency,
          next_payment_attempt: upcoming.next_payment_attempt || upcoming.created,
        }
      : null

    return NextResponse.json(
      { ok: true, customer, plan, upcoming: upcomingSummary },
      { status: 200, headers: { 'cache-control': 'no-store' } }
    )
  } catch (e: any) {
    const code = e?.code || e?.type || 'stripe_error'
    const status = typeof e?.statusCode === 'number' ? e.statusCode : 500
    return NextResponse.json({ ok: false, error: 'stripe_error', code }, { status, headers: { 'cache-control': 'no-store' } })
  }
}

