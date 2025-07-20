import Stripe from 'stripe'
import dotenv from 'dotenv'
import { Request, Response } from 'express'
import Course from '../models/courseModel'
import Transaction from '../models/transactionModel'
import UserCourseProgress from '../models/userCourseProgressModel'

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

  if (!amount) {
    res.status(400).json({ error: 'Amount and currency are required' })
  }

  if (typeof amount !== 'number' || amount <= 0) {
    res.status(400).json({ error: 'Amount must be a positive number' })
    return
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      description: 'Course Payment',
      metadata: {
        export_description: 'Export of software services to John Doe',
      },
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

export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { transactionId, userId, courseId, paymentProvider, amount } = req.body

  if (!transactionId || !userId || !courseId || !paymentProvider || !amount) {
    res.status(400).json({ error: 'All fields are required' })
    return
  }

  try {
    const course = await Course.get(courseId)
    const newTransaction = new Transaction({
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      paymentProvider,
      amount,
    })
    await newTransaction.save()

    const initialProgress = new UserCourseProgress({
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })),
      })),
      lastAccessedTimestamp: new Date().toISOString(),
    })
    await initialProgress.save()

    await Course.update(
      { courseId },
      {
        $ADD: {
          enrollments: [{ userId }],
        },
      }
    )

    res.status(201).json({
      message: 'Purchased course successfully',
      data: {
        newTransaction,
        courseProgress: initialProgress,
      },
    })
  } catch (error) {
    console.error('Transaction Creation Error:', error)
    res.status(500).json({ error: 'Failed to create transaction' })
  }
}
