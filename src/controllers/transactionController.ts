import Stripe from 'stripe'
import dotenv from 'dotenv'
import { Request, Response } from 'express'

dotenv.config()

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Stripe secret key is not defined in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const createStripePaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { amount, currency } = req.body

  if (!amount || !currency) {
    res.status(400).json({ error: 'Amount and currency are required' })
  }

  if (typeof amount !== 'number' || amount <= 0) {
    res.status(400).json({ error: 'Amount must be a positive number' })
    return
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    })

    res.status(200).json({
      message: '',
      data: { clientSecret: paymentIntent.client_secret },
    })
  } catch (error) {
    console.error('Stripe Payment Intent Error:', error)
    res.status(500).json({ error: 'Failed to create payment intent' })
  }
}
