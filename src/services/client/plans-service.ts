import { Response } from "express";
import mongoose from "mongoose";
import stripe from "src/configF/stripe";
import { detailsToAddOnSubscription } from "src/lib/constant";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { clientModel } from "src/models/client/clients-schema";
import { IdempotencyKeyModel } from "src/models/client/idempotency-schema";
import { getAmountFromPriceId, isPlanType } from "src/utils";
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

    let customer;
    if (!user.stripeCustomerId) {
        customer = await stripe.customers.create({
            metadata: {
                userId,
            },
            email: email,
            name: name,
        })
        await clientModel.findByIdAndUpdate(userId, { stripeCustomerId: customer.id }, { new: true, upsert: true })
    }
    else {
        customer = await stripe.customers.retrieve(user.stripeCustomerId)
    }
    const paymentIntent = await stripe.paymentIntents.create({
        amount: await getAmountFromPriceId(priceId) as number,
        currency: 'usd',
        customer: customer.id,
        metadata: { userId: id, idempotencyKey, planType, interval, name, email, planId: priceId },
        automatic_payment_methods: { enabled: true },
        setup_future_usage: 'off_session',
    }, {
        idempotencyKey
    })
    return {
        status: true,
        clientSecret: paymentIntent.client_secret,
    }

}

export const afterSubscriptionCreatedService = async (payload: any, transaction: mongoose.mongo.ClientSession, res: Response<any, Record<string, any>>) => {
    const sig = payload.headers['stripe-signature'];
    let checkSignature: Stripe.Event;
    try {
        checkSignature = stripe.webhooks.constructEvent(payload.rawBody, sig, process.env.STRIPE_LOCAL_WEBHOOK_SECRET as string);
    } catch (err: any) {
        console.log(`❌ Error message: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return
    }
    const event = payload.body

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, idempotencyKey, planType, interval, name, email, planId } = paymentIntent.metadata as any;

        const user = await clientModel.findById(userId);
        if (!user || !user.stripeCustomerId) return errorResponseHandler('User or customer ID not found', 404, res);


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
        let subscription: any;
        try {
            const paymentMethod = paymentIntent.payment_method;
            if (!paymentMethod) return errorResponseHandler('Payment method not found', 404, res);

            await stripe.paymentMethods.attach(paymentMethod as string, {
                customer: user.stripeCustomerId
            })
            // Set it as the default payment method for the customer
            await stripe.customers.update(user.stripeCustomerId, {
                invoice_settings: {
                    default_payment_method: paymentMethod as string,
                },
            })

            // Create subscription using the payment method from the successful PaymentIntent
            subscription = await stripe.subscriptions.create({
                customer: user.stripeCustomerId,
                items: [{ price: planId }],
                metadata: { userId, planType, interval, name, email },
                default_payment_method: paymentMethod as string,
                payment_settings: {
                    save_default_payment_method: 'on_subscription'
                },
                expand: ['latest_invoice.payment_intent']
            })

        }
        catch (error) {
            return errorResponseHandler('Error creating subscription', 500, res);
        }

        if (subscription.status === 'active' || subscription.status === 'trialing') {

            if (user.planOrSubscriptionId && user.planOrSubscriptionId !== subscription.id) {
                try {
                    await stripe.subscriptions.cancel(user.planOrSubscriptionId as string)
                } catch (error) {
                    console.error('Error cancelling old subscription:', error)
                }
            }

            await clientModel.findByIdAndUpdate(userId,
                {
                    planOrSubscriptionId: subscription.id,
                    planInterval: interval, planType: planType,
                    chatAllowed: detailsToAddOnSubscription(planType, interval)?.chatAllowed ?? false,
                    videoCount: detailsToAddOnSubscription(planType, interval)?.videoCount ?? 0
                },
                { new: true })
        }
    }


    if (event.type === 'payment_intent.canceled' || event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { customer: customerId } = paymentIntent
        const user = await clientModel.findOne({ stripeCustomerId: customerId })
        if (!user) return errorResponseHandler('User not found', 404, res)
        await clientModel.findByIdAndUpdate(user._id,
            {
                // planOrSubscriptionId: null,
                planInterval: null, planType: null,
                chatAllowed: false,
                videoCount: 0
            },
            { new: true })
        await stripe.customers.del(customerId as string)
    }


    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object as Stripe.Invoice;
        const { customer: customerId, subscription: subscriptionId } = invoice

        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)
        const metadata = subscription.metadata
        if (!subscription) return errorResponseHandler('Subscription not found', 404, res)

        const customer = await stripe.customers.retrieve(customerId as string)
        if (!customer) return errorResponseHandler('Customer not found', 404, res)

        if (subscription.status === 'active') {
            await clientModel.findOneAndUpdate({ stripeCustomerId: customerId },
                {
                    planOrSubscriptionId: subscription,
                    videoCount: detailsToAddOnSubscription(metadata.planType as string, metadata.interval as string)?.videoCount ?? 0,
                    chatAllowed: detailsToAddOnSubscription(metadata.planType as string, metadata.interval as string)?.chatAllowed ?? false
                }, { new: true })
        }
        else {
            await clientModel.findOneAndUpdate({ stripeCustomerId: customerId },
                {
                    videoCount: 0,
                    chatAllowed: false
                }, { new: true })
        }

    }

    if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object as Stripe.Invoice
        const { customer: customerId, subscription: subscriptionId } = invoice
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)
        if (!subscription) return errorResponseHandler('Subscription not found', 404, res)

        const customer = await stripe.customers.retrieve(customerId as string)
        if (!customer) return errorResponseHandler('Customer not found', 404, res)

        await clientModel.findOneAndUpdate({ stripeCustomerId: customerId },
            {
                videoCount: 0,
                chatAllowed: false
            }, { new: true })

    }

}


export const cancelSubscriptionService = async (id: string, subscriptionId: string, res: Response) => {
    const user = await clientModel.findById(id)
    if (!user) return errorResponseHandler("User not found", 404, res)

    const subscription = await stripe.subscriptions.retrieve(user.planOrSubscriptionId as string)
    if (!subscription) return errorResponseHandler("Subscription not found", 404, res)

    if (subscription.status === 'canceled') return errorResponseHandler("Subscription already cancelled", 400, res)
    if (subscription.id !== subscriptionId) return errorResponseHandler("Invalid subscription ID", 400, res)

    await stripe.subscriptions.cancel(subscription.id as string)
    await clientModel.findByIdAndUpdate(id,
        {
            planOrSubscriptionId: null,
            planInterval: null, planType: null,
            chatAllowed: false,
            videoCount: 0
        },
        { new: true })

        return {
            success: true,
            message: "Your subscription has been cancelled"
        }
}