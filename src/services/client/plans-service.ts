import { Response } from "express";
import stripe from "src/configF/stripe";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { clientModel } from "src/models/client/clients-schema";
import { isPlanType } from "src/utils";
import Stripe from "stripe";

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
        week: process.env.NEXT_PUBLIC_STAY_ROOTED_PLAN as string,
    },
    glowUp: {
        week: process.env.NEXT_PUBLIC_GLOW_UP_PLAN as string,
        month: process.env.NEXT_PUBLIC_GLOW_UP_MONTHLY_PLAN as string,
    }
}

export const createSubscriptionService = async (id: string, payload: any, res: Response) => {
    const { planType, userId, interval = 'week', email, name } = payload

    if (!planType || !userId) return errorResponseHandler("Invalid request", 400, res)
    if (!isPlanType(planType)) return errorResponseHandler("Invalid plan type", 400, res)
    const planPrices = priceIds[planType]
    const priceId = (planPrices as any)[interval as any]
    if (!priceId) return errorResponseHandler("Invalid interval", 400, res)

    const user = await clientModel.findById(userId)
    if (!user) return errorResponseHandler("User not found", 404, res)

    // if(user.planOrSubscriptionId !== priceId){
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
        },
        expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
    return {
        status: true,
        subscriptionId: subscription.id, clientSecret: paymentIntent.client_secret
    }

}   