import { Response } from "express";
import mongoose from "mongoose";
import stripe from "src/configF/stripe";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { clientModel } from "src/models/client/clients-schema";
import { IdempotencyKeyModel } from "src/models/client/idempotency-schema";
import { isPlanType } from "src/utils";
import Stripe from "stripe";
import { v4 as uuidv4 } from 'uuid';
export type PlanType = 'stayRooted' | 'glowUp';

interface PriceIdConfig {
    stayRooted: {
        week: string;
    };
    glowUp: {
        week: string;
        month: string;
    };
}
const priceIds: PriceIdConfig = {
    stayRooted: {
        week: process.env.STRIPE_PRICE_STAY_ROOTED as string,
    },
    glowUp: {
        week: process.env.STRIPE_PRICE_GLOW_UP as string,
        month: process.env.STRIPE_PRICE_GLOW_UP_MONTHLY as string,
    }
}

export const createSubscriptionService = async (id: string, payload: any, res: Response) => {
    const idempotencyKey = uuidv4()
    const userId = id
    const { planType, interval = 'week', email, name } = payload
    if (!planType || !userId) return errorResponseHandler("Invalid request", 400, res)
    if (!isPlanType(planType)) return errorResponseHandler("Invalid plan type", 400, res)
    const planPrices = priceIds[planType]
    const priceId = (planPrices as any)[interval as any]
    if (!priceId) return errorResponseHandler("Invalid interval", 400, res)

    const user = await clientModel.findById(userId)
    if (!user) return errorResponseHandler("User not found", 404, res)

    // if (user.planOrSubscriptionId) {
    //     await stripe.subscriptions.cancel(user.planOrSubscriptionId)
    // }

    let customer;
    if (!user.stripeCustomerId) {
        customer = await stripe.customers.create({
            metadata: {
                userId,
            },
            email: email,
            name: name
        })
        await clientModel.findByIdAndUpdate(userId, { stripeCustomerId: customer.id }, { new: true, upsert: true })
    }
    else {
        customer = await stripe.customers.retrieve(user.stripeCustomerId)
    }
    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
            price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
            save_default_payment_method: 'on_subscription',
        },
        metadata: {
            userId,
            planType,
            interval,
            name,
            email,
            idempotencyKey
        },

        expand: ['latest_invoice.payment_intent']
    },
        {
            idempotencyKey
        })


    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    return {
        status: true,
        subscriptionId: subscription.id, clientSecret: paymentIntent.client_secret
    }

}

export const afterSubscriptionCreatedService = async (payload: any, transaction: mongoose.mongo.ClientSession, res: Response<any, Record<string, any>>) => {
    const sig = payload.headers['stripe-signature'];
    let checkSignature: Stripe.Event;
    try {
        checkSignature = stripe.webhooks.constructEvent(payload.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err: any) {
        console.log(`❌ Error message: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return
    }
    const event = payload.body
    console.log('event.data.object.status: ', event.data.object.status);
    if (event.type === 'customer.subscription.created' && event.data.object.status === 'active') {
        console.log('event.type ---> ', event.type);
        console.log('subscription--->', event.data.object);
        const subscription = event.data.object
        const { userId, idempotencyKey } = subscription.metadata
        console.log('idempotencyKey: ', idempotencyKey);

        const existingEvent = await IdempotencyKeyModel.findOne({
            $or: [
                { eventId: event.id },
                { key: idempotencyKey }
            ]
        })

        if (existingEvent) {
            await IdempotencyKeyModel.findByIdAndDelete(existingEvent._id)
            return
        }

        if (event.id) {
            await IdempotencyKeyModel.findOneAndUpdate(
                { key: idempotencyKey },
                {
                    $set: {
                        eventId: event.id,
                        processed: true,
                        processedAt: new Date()
                    }
                },
                { upsert: true }
            )
        }

        // Find user's current subscription
        const user = await clientModel.findById(userId);
        console.log('user: ', user);
        if (user?.planOrSubscriptionId && user.planOrSubscriptionId !== subscription.id) {
            try {
                await stripe.subscriptions.cancel(user.planOrSubscriptionId)
            }
            catch (error) {
                console.error('Error canceling old subscription:', error)
            }
        }

        // Update user with new subscription ID
        await clientModel.findByIdAndUpdate(userId, { planOrSubscriptionId: subscription.id }, { new: true })
    }
}