import { configDotenv } from "dotenv";
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
configDotenv()
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
    if (user.stripeCustomerId == "" || user.stripeCustomerId === null || !user.stripeCustomerId) {
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
        customer = await stripe.customers.retrieve(user.stripeCustomerId as string)
    }
    try {
        // Create the subscription directly with payment_behavior set to default_incomplete
        const subscription: any = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
            metadata: { userId: id, idempotencyKey, planType, interval, name, email, planId: priceId },
        }, {
            idempotencyKey
        });

        // Retrieve the client secret from the payment intent
        const clientSecret = subscription.latest_invoice.payment_intent.client_secret;

        return {
            status: true,
            clientSecret,
            subscriptionId: subscription.id
        }
    } catch (error) {
        console.error('Subscription creation error:', error);
        return errorResponseHandler("Failed to create subscription", 400, res);
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

    if (event.type === 'payment_intent.succeeded') {
        let paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.invoice as string;
        if (!invoiceId) {
            console.log('No invoice ID found in payment intent');
            return;
        }

        // Fetch the invoice to get subscription ID
        const invoice = await stripe.invoices.retrieve(invoiceId);
        const subscriptionId = invoice.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const { userId, planType, interval } = subscription.metadata;
        const user = await clientModel.findById(userId);
        if (!user) return errorResponseHandler('User or customer ID not found', 404, res);

        if (user.planOrSubscriptionId && user.planOrSubscriptionId !== subscriptionId) {
            try {
                await stripe.subscriptions.cancel(user.planOrSubscriptionId as string)
            } catch (error) {
                console.error('Error cancelling old subscription:', error)
            }
        }
        await clientModel.findByIdAndUpdate(userId, {
            planType,
            planInterval: interval,
            planOrSubscriptionId: subscriptionId, // Using planId from metadata instead of nonexistent subscription property
            videoCount: detailsToAddOnSubscription(planType, interval)?.videoCount ?? 0,
            chatAllowed: detailsToAddOnSubscription(planType, interval)?.chatAllowed ?? false
        })
        return {
            success: true,
            message: 'Subscription created successfully'
        }
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
                    planOrSubscriptionId: subscriptionId,
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
        return {
            success: true,
            message: 'Subscription renewed successfully'
        }

    }
    if (event.type === 'payment_intent.canceled' || event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { customer: customerId } = paymentIntent
        const user = await clientModel.findOne({ stripeCustomerId: customerId })
        if (!user) return errorResponseHandler('User not found', 404, res)
        // Handle payment failure without deleting customer data
        return { success: false, message: 'Payment failed or was canceled' }
    }

    if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object as Stripe.Invoice
        const { customer: customerId, subscription: subscriptionId } = invoice
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)
        if (!subscription) return errorResponseHandler('Subscription not found', 404, res)

        const customer = await stripe.customers.retrieve(customerId as string)
        if (!customer) return errorResponseHandler('Customer not found', 404, res)

        // Cancel the subscription in Stripe
        await stripe.subscriptions.cancel(subscriptionId as string)

        // Update the user record
        await clientModel.findOneAndUpdate({ stripeCustomerId: customerId },
            {
                videoCount: 0,
                chatAllowed: false,
                planOrSubscriptionId: null,
                planInterval: null,
                planType: null
            },
            { new: true }
        )

        return {
            success: true,
            message: "Subscription canceled due to failed payment"
        }
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
            videoCount: 0,
            // stripeCustomerId: null
        },
        { new: true })

    return {
        success: true,
        message: "Your subscription has been cancelled"
    }
}